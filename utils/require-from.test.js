const {
  resolvePackagePath,
  resolveFrom,
  requireFrom,
  requireFromLerna
} = require('./require-from');

describe('resolvePackagePath(package)', () => {
  test(`resolvePackagePath('lerna')`, () => {
    expect(resolvePackagePath('lerna')).toMatch(/\/node_modules\/lerna(\/|$)/);
  });
});

describe('resolveFrom(package)', () => {
  test(`resolveFrom('lerna')('@lerna/cli')`, () => {
    const resolve = resolveFrom('lerna');
    expect(typeof resolve).toBe('function');

    expect(resolve('@lerna/cli')).toMatch(/\/node_modules\/@lerna\/cli(\/|$)/);
  });
});

describe('requireFrom(package)', () => {
  test(`requireFrom('lerna')('@lerna/cli')`, () => {
    const req = requireFrom('lerna');
    expect(typeof req).toBe('function');

    expect(req('@lerna/cli')).toBeDefined();
  });

  test(`requireFrom('lerna')('@lerna/run/command')`, () => {
    const req = requireFrom('lerna');
    expect(typeof req).toBe('function');

    const mod = req('@lerna/run/command');
    expect(typeof mod).toBe('object');

    // https://github.com/lerna/lerna/blob/main/commands/run/command.js#L8
    expect(mod.command).toBe('run <script>');
  });
});

describe('requireFromLerna(request)', () => {
  test(`requireFromLerna('@lerna/run/command')`, () => {
    const mod = requireFromLerna('@lerna/run/command');

    expect(typeof mod).toBe('object');

    // https://github.com/lerna/lerna/blob/main/commands/run/command.js#L8
    expect(mod.command).toBe('run <script>');
  });
});
