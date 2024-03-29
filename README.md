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

## Usage

- [Global Options](#Global-Options)
  - [Partition Count](#Partition-Count): `--split`, `--partition`
  - [Distribution Strategy](#Distribution-Strategy)
    - [`--distribute-by count`](#--distribute-by-count)
    - [`--distribute-by weight`](#--distribute-by-weight)
- [Commands](#Commands)
  - [`lerna-parallelism run`](#lerna-parallelism-run)
  - [Other Commands](#Other-Commands)

### Global Options

`lerna-parallelism` adds a few CLI options on top of `lerna`. The following
options are globally understood by all commands supported by
`lerna-parallelism`.

All other command options behave just like the upstream `lerna` version of the
respective command.

#### Partition Count

> Split the list of packages into `--split n` chunks and take the chunk with
> zero-based index `--partition n`.

- `--split n`: The number of split partitions.
  Defaults to [`$CIRCLE_NODE_TOTAL`][circleci-parallelism-env].<br>
  _This should be equal to the total number of worker instances._
- `--partition n`: Which partition to execute, zero-based.
  Defaults [`$CIRCLE_NODE_INDEX`][circleci-parallelism-env].<br>
  _This should be the index of the individual worker instance you're running on._

[circleci-parallelism-env]: https://circleci.com/docs/2.0/parallelism-faster-jobs/#using-environment-variables-to-split-tests

#### Distribution Strategy

> Algorithm to use for deciding which package goes into which partition.

##### `--distribute-by count`

> **Default.** Split into even-sized partitions.

The packages are taken in order as emitted by `lerna` and simply split into
[`--split n`](#Partition-Count) partitions of equal size.

If the total package count cannot be distributed evenly, some partition(s) may
be slightly smaller than the other partition(s).

**Example:** 26 packages (named `a`–`z`) are split into `--split 4` partitions.

- `--partition 0` (size = 7): `a`, `b`, `c`, `d`, `e`, `f`, `g`
- `--partition 1` (size = 7): `h`, `i`, `j`, `k`, `l`, `m`, `n`
- `--partition 2` (size = 6): `o`, `p`, `q`, `r`, `s`, `t`
- `--partition 3` (size = 6): `u`, `v`, `w`, `x`, `y`, `z`

##### `--distribute-by weight`

> Assign a weight to each package and split into even-weighted partitions.

The packages are ordered by "weight" in descending order and iteratively
assigned to the current lightest partition. This results in partitions with
approximately equal weight, but uneven size by total package count.

This strategy is useful to account for different CI runtimes per package.

Each package's weight is read from the `lernaPackageWeight` property from its
`package.json`. If missing, it defaults to `1`. You can change the property
lookup name with the `--packageWeightKey` option, like
`--packageWeightKey testRuntime`. It just has to be a `number`.

You're expected to add these weights yourself, where necessary. Basing the
weights off of the package's CI runtime is sensible. Keep in mind, that you also
need to maintain these weights: you should adjust the weights from time to time,
e.g. when adding new tests or build steps to a package, that increase it's
overall CI runtime.

**Example:** 9 packages are split into `--split 3` partitions using the
following weights.

| Name   | `a` | `b` | `c` | `d` | `e` | `f` | `g` | `h` | `i` |
| ------ | --: | --: | --: | --: | --: | --: | --: | --: | --: |
| Weight |   9 |   5 |   5 |   5 |   2 |   2 |   2 |   1 |   1 |

- `--partition 0` (size = 2, weight = 10): `a` (9), `h` (1)
- `--partition 1` (size = 3, weight = 11): `b` (5), `d` (5), `i` (1)
- `--partition 2` (size = 4, weight = 11): `c` (5), `e` (2), `f` (2), `g` (2)

### Commands

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

## License

This project is licensed under the [ISC License](LICENSE.md).
