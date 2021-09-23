const assert = require('assert');

const { CIRCLE_NODE_INDEX, CIRCLE_NODE_TOTAL } = process.env;

function validate(split, partition) {
  assert(
    Number.isSafeInteger(split) && split > 0,
    `'total' (${split}) must be a positive integer`
  );
  assert(
    Number.isSafeInteger(partition) && partition >= 0,
    `'partition' (${partition}) must be a positive integer`
  );
  assert(
    Number.isSafeInteger(partition) && partition >= 0,
    `'partition' (${partition}) must be smaller than 'split' (${split})`
  );
}

module.exports.splittable = yargs =>
  yargs
    .option('split', {
      type: 'number',
      default: CIRCLE_NODE_TOTAL ? Number.parseInt(CIRCLE_NODE_TOTAL, 10) : 1,
      defaultDescription: 'The number of partitions.  $CIRCLE_NODE_TOTAL ?? 1'
    })
    .option('partition', {
      type: 'number',
      default: CIRCLE_NODE_INDEX ? Number.parseInt(CIRCLE_NODE_INDEX, 10) : 0,
      defaultDescription:
        'The partition ID for this instance to execute.  $CIRCLE_NODE_INDEX ?? 0'
    })
    .option('loadBalance', {
      type: 'boolean',
      default: false,
      defaultDescription:
        'Use a greedy round-robin load balancing algo instead of default split'
    })
    .option('packageWeightKey', {
      type: 'string',
      default: 'lernaPackageWeight',
      defaultDescription:
        "The lookup key to use for reading the project's weight from its package.json"
    })
    .check(({ split, partition }) => {
      validate(split, partition);
      return true;
    });

/**
 * Returns a two-index tuple or the `chunkIndex` chunk to be used with
 * `array.slice(start, end)`, where `end` is non-inclusive, to slice an array of
 * `totalSize` into `chunkCount` balanced chunks.
 *
 * @return [start, end]
 */
function getChunkBounds(totalSize, chunkCount, chunkIndex) {
  validate(chunkCount, chunkIndex);

  const isLast = chunkIndex === chunkCount - 1;
  const start = Math.max(
    0,
    Math.ceil((totalSize / chunkCount) * chunkIndex) - 1
  );
  const end = isLast
    ? totalSize
    : Math.max(0, Math.ceil((totalSize / chunkCount) * (chunkIndex + 1)) - 1);

  return [start, end];
}

module.exports.getChunkBounds = getChunkBounds;

module.exports.getSplitPackages = function (packages, split, partition) {
  validate(split, partition);

  const total = packages.length;
  const [start, end] = getChunkBounds(total, split, partition);

  const chunk = packages.slice(start, end);
  const partitionSize = chunk.length;

  return {
    logMessage: `Split ${
      partition + 1
    }/${split} (${partitionSize} packages of ${total} packages total)`,
    partitionSize,
    total,
    packages: chunk
  };
};

module.exports.getLoadBalancedPackages = function (
  packages,
  split,
  partition,
  packageWeightKey,
  logger
) {
  validate(split, partition);

  const total = packages.length;

  // Init empty partitions
  const partitions = [];
  for (let i = 0; i < split; i++) {
    partitions.push([]);
  }

  // Init partition weight totals
  const partitionWeights = {};
  partitions.forEach((_, index) => {
    partitionWeights[index] = 0;
  });

  // Sort packages by weight in descending order.
  // We will put the largest remaining weighted package in the partition with the least total weight.
  const packagesSortedByWeightDesc = [...packages].sort(
    (a, b) =>
      (b.get(packageWeightKey) || 1) - (a.get(packageWeightKey) || 1)
  );

  const getLightestPartition = () => {
    let minId;
    let minWeight = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < split; i++) {
      if (minWeight > partitionWeights[i]) {
        minWeight = partitionWeights[i];
        minId = i;
      }
    }

    return minId;
  };

  packagesSortedByWeightDesc.forEach(project => {
    const lightestPartition = getLightestPartition();
    logger.debug(
      `Adding package ${project.name} (weight: ${project.get(
        packageWeightKey
      )}) to partition ${lightestPartition}`
    );
    partitions[lightestPartition].push(project);
    partitionWeights[lightestPartition] +=
      project.get(packageWeightKey) || 1;
  });

  logger.debug(
    partitions.map(part =>
      part.map(pack => [pack.name, pack.get(packageWeightKey) || 1])
    )
  );
  logger.debug(partitionWeights);

  const chunk = partitions[partition];

  const partitionSize = chunk.length;

  return {
    logMessage: `Load Balanced Split ${
      partition + 1
    }/${split} (${partitionSize} packages of ${total} packages total)`,
    partitionSize,
    total,
    packages: chunk
  };
};
