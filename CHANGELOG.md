## v0.4.0 (2022-02-27)

- chore(deps): re-roll `yarn.lock` (d0eb0f0)
- chore(deps): uprade `@types/node@^17.0.21` (ffd71c3)
- chore(deps): uprade `release-it-lerna-changelog@^4.0.1` (7118783)
- chore(deps): uprade `release-it@^14.12.5` (a8733df)
- chore(deps): uprade `jest@^27.5.1` (ad1a71e)
- chore(deps): uprade `yargs@^17.0.8` (ca53149)
- chore(deps): move lerna to devDeps and peerDeps (d816db5)
  ([#21](https://github.com/ClarkSource/lerna-parallelism/pull/21)) by
  [@sugarshin](https://github.com/sugarshin)


## v0.3.0 (2021-09-23)

- feat: support `--packageWeightKey nested.path`
  ([#20](https://github.com/ClarkSource/lerna-parallelism/pull/20))


## v0.2.1 (2021-09-23)

- fix(utils): cover `requireFromLerna`

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

## v0.1.5 (2021-09-23)

- fix(utils): cover `requireFromLerna`<br>
  Backported from `v0.2.1`.

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
