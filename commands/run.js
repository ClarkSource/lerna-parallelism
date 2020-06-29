const { RunCommand: LernaRunCommand } = require('@lerna/run');

const { splittable, getSplitPackages } = require('../options/split');

module.exports = { ...require('@lerna/run/command') };

class RunCommand extends LernaRunCommand {
  execute() {
    if (this.options.split > 1) {
      const { split, partition } = this.options;

      const { packages, logMessage } = getSplitPackages(
        this.packagesWithScript,
        split,
        partition
      );

      this.packagesWithScript = packages;
      this.count = packages.length;

      this.logger.info('split', logMessage);
    }

    return super.execute();
  }
}

module.exports.RunCommand = this.RunCommand;

module.exports.handler = function handler(argv) {
  return new RunCommand(argv);
};

const { builder } = module.exports;
module.exports.builder = yargs => splittable(builder(yargs));
