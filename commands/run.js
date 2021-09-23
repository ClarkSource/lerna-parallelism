const {
  splittable,
  getSplitPackages,
  getLoadBalancedPackages
} = require('../options/split');
const { requireFromLerna } = require('../utils/require-from');

const { RunCommand: LernaRunCommand } = requireFromLerna('@lerna/run');

module.exports = { ...requireFromLerna('@lerna/run/command') };

class RunCommand extends LernaRunCommand {
  execute() {
    if (this.options.split > 1) {
      const { split, partition, loadBalance, packageWeightKey } = this.options;

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

/** @param {import('@types/yargs').Argv} argv */
module.exports.handler = argv => new RunCommand(argv);

const { builder } = module.exports;

/** @param {import('@types/yargs').Argv} yargs */
module.exports.builder = yargs => splittable(builder(yargs));
