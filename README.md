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
for parallel execution / splitting, for e.g.
[CircleCI's `parallelism` feature.][circleci-parallelism]

[lerna]: https://github.com/lerna/lerna
[circleci-parallelism]: https://circleci.com/docs/2.0/parallelism-faster-jobs/

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

For instance, this executes the last of four partitions. It also passes along
`--stream` & `--concurrency 1` to prefix log lines with the package name.

```sh
yarn lerna run \
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
