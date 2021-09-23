const assert = require('assert');

/**
 * Returns `defaultValue`, if and only if `value` is `undefined`. Otherwise
 * returns `value`.
 *
 * @param {unknown} value
 * @param {unknown} defaultValue
 */
const withDefault = (value, defaultValue) =>
  typeof value === 'undefined' ? defaultValue : value;

/**
 * Returns `value`, if and only if `value` is a valid `number` (not `NaN`) and
 * in the range `[min, max]`. Otherwise throws an `AssertionError`.
 *
 * @param {number|unknown} value
 * @param {number} min
 * @param {number} max
 * @returns {number|never}
 */
const assertInRange = (value, min, max) => {
  assert.ok(
    typeof value === 'number' && !Number.isNaN(value),
    `value '${value}' is not a valid number`
  );
  assert.ok(value >= min, `value ${value} is less than minimum ${min}`);
  assert.ok(value <= max, `value ${value} is greater than maximum ${max}`);
  return value;
};

/**
 * Builds a lense for reading the package weight at `path` from `pkg`.
 *
 * If the property is not defined, defaults to `defaultValue`. Asserts that the
 * value, if defined, is a valid `number` in the range of `[min, max]`.
 *
 * @param {string} keyPath
 * @param {number} min
 * @param {number} max
 * @param {number} defaultValue
 * @returns {(pkg: Package) => number | never}
 */
module.exports.getWeightFromPackage = (
  keyPath,
  { min = 0, max = Number.POSITIVE_INFINITY, defaultValue = 1 } = {}
) => {
  const readWeight = pkg => pkg.get(keyPath);

  return pkg =>
    assertInRange(withDefault(readWeight(pkg), defaultValue), min, max);
};
