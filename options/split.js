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
      defaultDescription: '$CIRCLE_NODE_TOTAL ?? 1'
    })
    .option('partition', {
      type: 'number',
      default: CIRCLE_NODE_INDEX ? Number.parseInt(CIRCLE_NODE_INDEX, 10) : 0,
      defaultDescription: '$CIRCLE_NODE_INDEX ?? 0'
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
