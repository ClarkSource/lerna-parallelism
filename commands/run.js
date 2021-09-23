const { RunCommand: LernaRunCommand } = require('@lerna/run');

const {
  splittable,
  getSplitPackages,
  getLoadBalancedPackages
} = require('../options/split');

module.exports = { ...require('@lerna/run/command') };

class RunCommand extends LernaRunCommand {
  execute() {
    if (this.options.split > 1) {
      const {
        split,
        partition,
        loadBalance,
        packageWeightKey
      } = this.options;

      const { packages, logMessage } = loadBalance
        ? getLoadBalancedPackages(
            this.packagesWithScript,
            split,
            partition,
            packageWeightKey,
            this.logger
          )
        : getSplitPackages(this.packagesWithScript, split, partition);

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
