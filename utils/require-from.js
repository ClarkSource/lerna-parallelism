const path = require('path');

function resolvePackagePath(packageName) {
  const packageMainPath = require.resolve(packageName);
  const packagePath = path.dirname(packageMainPath);
  return packagePath;
}
module.exports.resolvePackagePath = resolvePackagePath;

function resolveFrom(packageName) {
  const packagePath = module.exports.resolvePackagePath(packageName);
  const options = { paths: [packagePath] };
  return request => require.resolve(request, options);
}

module.exports.resolveFrom = resolveFrom;

function requireFrom(packageName) {
  const resolve = module.exports.resolveFrom(packageName);
  return request => require(resolve(request));
}
module.exports.requireFrom = requireFrom;

module.exports.requireFromLerna = module.exports.requireFrom('lerna');
