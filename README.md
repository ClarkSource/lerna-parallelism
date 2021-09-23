<p align="center">
  <a href="https://www.clark.de/de/jobs">
    <br><br><br><br><br>
    <img alt="CLARK" src="./docs/assets/clark.svg" height="40">
    <br><br><br><br><br>
  </a>
</p>

# lerna-parallelism

[![CI](https://github.com/ClarkSource/lerna-parallelism/workflows/CI/badge.svg)](https://github.com/ClarkSource/lerna-parallelism/actions)
[![npm version](https://badge.fury.io/js/lerna-parallelism.svg)](http://badge.fury.io/js/lerna-parallelism)
[![Download Total](https://img.shields.io/npm/dt/lerna-parallelism.svg)](http://badge.fury.io/js/lerna-parallelism)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![CLARK Open Source](https://img.shields.io/badge/CLARK-Open%20Source-%232B6CDE.svg)](https://www.clark.de/de/jobs)<br>
[![Dependabot enabled](https://img.shields.io/badge/dependabot-enabled-blue.svg?logo=dependabot)](https://dependabot.com/)
[![dependencies Status](https://david-dm.org/ClarkSource/lerna-parallelism/status.svg)](https://david-dm.org/ClarkSource/lerna-parallelism)
[![devDependencies Status](https://david-dm.org/ClarkSource/lerna-parallelism/dev-status.svg)](https://david-dm.org/ClarkSource/lerna-parallelism?type=dev)

**lerna-parallelism** is an extension of [**lerna**][lerna] that adds support
for deterministically partitioning packages to allow parallel execution across
multiple workers, like [CircleCI's `parallelism` feature][circleci-parallelism].

[lerna]: https://github.com/lerna/lerna
[circleci-parallelism]: https://circleci.com/docs/2.0/parallelism-faster-jobs/

- [Introduction](#Introduction)
  - [Use Case](#Use-Case)
  - [Quick Example](#Quick-Example)
- [Installation](#Installation)
- [Usage](#Usage)

## Introduction

### Use Case

> Speeding up monorepo CI pipelines via multi-worker parallelization.

You maintain a large [`lerna`][lerna] monorepo with lots of individual packages.
In CI you run a script / command for many or all of the packages.

```sh
# Execute the `test` script for all packages.
lerna run \
  # Prefix each log line with the package name.
  # https://github.com/lerna/lerna/tree/main/commands/run#--stream
  --stream \
  # Run packages sequentially to avoid interleaved log output and resource contention.
  # https://github.com/lerna/lerna/blob/main/core/global-options/README.md#--concurrency
  --concurrency 1 \
  test
```

Your CI workflow is taking far too long, because you process all packages
sequentially on a single CI worker instance / node / VM.

Your CI service supports spinning up multiple worker instances, but you don't
know how tell `lerna` to distribute the workload across these instances. You
could use [`--scope`][lerna-scope] and hard-code all package names, but this is
difficult to maintain, as packages are added, renamed or removed.

[lerna-scope]: https://github.com/lerna/lerna/tree/main/core/filter-options#--scope-glob

### Quick Example

**lerna-parallelism** makes it easy to split the workload — the packages to be
processed — dynamically and deterministically across separate worker instances.

```sh
lerna-parallelism run \
  # Keep your `lerna` options just like before.
  --stream \
  --concurrency 1 \
  # Divide the list of packages to process into 4 equal-sized chunks.
  # This should be equal to the total number of worker instances.
  --split 4 \
  # Take only the first chunk (zero-based).
  # This should be the index of the individual worker instance you're running on.
  --partition 0 \
  # Run the `test` script for all packages in that chunk only.
  test
```

## Installation

### Project-local Installation

```sh
yarn add -D lerna-parallelism

# And then run via:
yarn lerna-parallelism ...
```

### Global Installation

```sh
yarn global add lerna-parallelism
# or
volta install lerna-parallelism

# And then run via:
lerna-parallelism ...
```

## Basic Usage

`lerna-parallelism` adds two additional CLI options on top of `lerna`:

- `--split n`: The number of split partitions. Defaults to
  [`$CIRCLE_NODE_TOTAL`][circleci-parallelism-env].
- `--partition n`: Which partition to execute, zero-based. Defaults
  [`$CIRCLE_NODE_INDEX`][circleci-parallelism-env].

[circleci-parallelism-env]: https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-environment-variables-to-split-tests

All other command options behave just like the upstream `lerna` version of the
respective command.

The following commands from `lerna` are supported:

### `lerna-parallelism run`

[`lerna run`][lerna-run]

[lerna-run]: https://github.com/lerna/lerna/blob/master/commands/run#readme

> Run an npm script in each package that contains that script.

For instance, this executes the last of four partitions. It also passes along
`--stream` & `--concurrency 1` to prefix log lines with the package name.

```sh
lerna-parallelism run \
  --stream \
  --concurrency 1 \
  --split 4 \
  --partition 3 \
  test
```

### Other Commands

For some commands, like `lerna bootstrap`, splitting makes no sense. For some
others, it does, specifically:

- `lerna changed`
- `lerna exec`
- `lerna list`
- `lerna publish`

If you'd like to see support for these commands as well, feel free to submit a
pull request!

## Load Balancing (advanced)

By default, `lerna-parallelism` gives each partition an approximately equal
number of packages by chunking an alphabetized array. Depending on the number of
tests each of your packages has, you may find this results in imbalanced
runtimes between partitions.

To address this, `lerna-parallelism` offers a load balancing mode which uses a
weighted round-robin algorithm, informed by a weight "hint" specified in each
package's `package.json`.

This adds two additional CLI options in addition to those above:

- `--loadBalance`: Toggles load-balancing mode. Defaults to `false`.
- `--packageWeightKey myProjectWeight`: The lookup key used to read the
  project's weight from its `package.json`. Defaults to `lernaPackageWeight`.

### Usage

`lerna-parallelism --loadBalance run test`

And add a `lernaPackageWeight` property (numeric) to your package.json for each
package. If it is missing, `1` is the default weight assigned.

If you have a need to partition differently for multiple CI tasks, you can use
`--packageWeightKey` to specify which weight property should be read from
`package.json`.

## License

This project is licensed under the [ISC License](LICENSE.md).
