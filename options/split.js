const assert = require('assert');

const { CIRCLE_NODE_INDEX, CIRCLE_NODE_TOTAL } = process.env;

/**
 * Asserts that the `split` and `partition` values are valid.
 *
 * @param {number} split The total number of chunks.
 * @param {number} partition The zero-based index of a chunk.
 */
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

/**
 * @param {import('@types/yargs').Argv} yargs
 */
module.exports.splittable = yargs =>
  yargs
    .option('split', {
      group: 'Partition Count',
      type: 'number',
      default: CIRCLE_NODE_TOTAL ? Number.parseInt(CIRCLE_NODE_TOTAL, 10) : 1,
      defaultDescription: 'The number of partitions.  $CIRCLE_NODE_TOTAL ?? 1'
    })
    .option('partition', {
      group: 'Partition Count',
      type: 'number',
      default: CIRCLE_NODE_INDEX ? Number.parseInt(CIRCLE_NODE_INDEX, 10) : 0,
      defaultDescription:
        'The partition ID for this instance to execute.  $CIRCLE_NODE_INDEX ?? 0'
    })
    .option('distributeBy', {
      group: 'Distribution Strategy',
      description:
        'Algorithm to use for deciding which package goes into which partition.',
      type: 'string',
      choices: ['count', 'weight'],
      default: 'count',
      defaultDescription: 'Split into even-sized partitions.'
    })
    .option('packageWeightKey', {
      group: 'Distribution Strategy',
      description:
        "The lookup key to use for reading the package's weight from its `package.json`",
      type: 'string',
      default: 'lernaPackageWeight'
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
 * @param {number} totalSize The total size of the array to be sliced.
 * @param {number} chunkCount The number of chunks to slice the array into.
 * @param {number} chunkIndex The zero-based index of the chunk to return the
 * `[start, end]` bounds for.
 *
 * @returns {[start: number, end: number]}
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

/**
 * Split `packages` into `split`evenly-sized chunks, returning the `partition`
 * chunk.
 *
 * @param {Package[]} packages The list of packages to be distributed.
 * @param {number} split The number of chunks to distribute the packages into.
 * @param {number} partition The zero-based index of the chunk to return.
 *
 * @returns The chunk identified by `partition`.
 */
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

/**
 * Split `packages` into `split` evenly-weighted chunks, using
 * `packageWeightKey` to lookup the weight of each package from its
 * `package.json`.
 *
 * @param {Package[]} packages The list of packages to be distributed.
 * @param {number} split The number of chunks to distribute the packages into.
 * @param {number} partition The zero-based index of the chunk to return.
 * @param {string} packageWeightKey The lookup key to use for reading the
 * packages's estimated weight from its `package.json`.
 * @param {Logger} logger
 *
 * @returns The chunk identified by `partition`.
 */
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
  const partitions = Array.from({ length: split });
  for (let i = 0; i < partitions.length; i++) partitions[i] = [];

  // Init partition weight totals
  const partitionWeights = Array.from({ length: partitions.length }).fill(0);

  // Sort packages by weight in descending order.
  // We will put the largest remaining weighted package in the partition with the least total weight.
  const packagesSortedByWeightDesc = [...packages].sort(
    (a, b) => (b.get(packageWeightKey) || 1) - (a.get(packageWeightKey) || 1)
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

  for (const project of packagesSortedByWeightDesc) {
    const lightestPartition = getLightestPartition();
    logger.debug(
      `Adding package ${project.name} (weight: ${project.get(
        packageWeightKey
      )}) to partition ${lightestPartition}`
    );
    partitions[lightestPartition].push(project);
    partitionWeights[lightestPartition] += project.get(packageWeightKey) || 1;
  }

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
