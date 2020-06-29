const lernaCLI = require('@lerna/cli');
const lernaPkg = require('lerna/package.json');

const runCmd = require('./commands/run');

module.exports.main = function main(argv) {
  const context = {
    lernaVersion: lernaPkg.version
  };

  return (
    lernaCLI()
      // .command(addCmd)
      // .command(bootstrapCmd)
      // .command(changedCmd)
      // .command(cleanCmd)
      // .command(createCmd)
      // .command(diffCmd)
      // .command(execCmd)
      // .command(importCmd)
      // .command(infoCmd)
      // .command(initCmd)
      // .command(linkCmd)
      // .command(listCmd)
      // .command(publishCmd)
      .command(runCmd)
      // .command(versionCmd)
      .parse(argv, context)
  );
};
