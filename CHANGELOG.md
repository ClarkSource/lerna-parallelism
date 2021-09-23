## v0.2.0 (2021-09-23)

- feat: weighted load-balancing via `package.json` config
  ([#14](https://github.com/ClarkSource/lerna-parallelism/pull/14) by
  [@kdnutrien](https://github.com/kdnutrien),
  [#18](https://github.com/ClarkSource/lerna-parallelism/pull/18))<br>
  When using [`--distribute-by weight`](https://github.com/ClarkSource/lerna-parallelism#--distribute-by-weight),
  you can assign a weight to each package and split into even-weighted
  partitions.
- docs: improve `README.md`
- docs: add DocBlock code comments

## v0.1.4 (2021-09-23)

- chore(deps): update all dependencies to the latest version
- chore(deps): allow `lerna` `^3.22.1 || ^4.0.0`
- refactor(deps): `require` relative from `lerna`<br>
  Drop the direct dependencies to `@lerna/*` & `yargs`. Instead only depend on
  `lerna` and look up all further sub-dependencies relative from there.

## v0.1.3 (2020-07-10)

## v0.1.2 (2020-06-29)

## v0.1.1 (2020-06-29)

## v0.1.0 (2020-06-29)
