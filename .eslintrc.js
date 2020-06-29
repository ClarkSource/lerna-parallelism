module.exports = {
  extends: '@clark/node',
  overrides: [
    {
      files: ['*.test.js'],
      env: {
        jest: true
      }
    }
  ]
};
