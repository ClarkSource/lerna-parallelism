const path = require('path');

module.exports = {
  resolvePackagePath(package) {
    const packageMainPath = module.exports.resolve(package);
    const packagePath = path.dirname(packageMainPath);
    return packagePath;
  },

  resolveFrom(package) {
    const packagePath = module.exports.resolvePackagePath(package);
    const options = { paths: [packagePath] };
    return request => require.resolve(request, options);
  },

  requireFrom(package) {
    const resolve = module.exports.resolveFrom(package);
    return request => require(resolve(request));
  },

  requireFromLerna: module.exports.requireFrom('lerna')
};
