const { AssertionError } = require('assert');

const { getWeightFromPackage } = require('./package-weight');

describe('getWeightFromPackage(path, opts?)(pkg)', () => {
  const mockPackage = (pkg = {}) => ({
    get: key => pkg[key],
    toJSON: () => pkg
  });

  describe('`keyPath`', () => {
    test('respects `keyPath`', () => {
      const pkg = mockPackage({ foo: 420, bar: 69, nested: { baz: 1337 } });

      expect(getWeightFromPackage('foo')(pkg)).toBe(420);
      expect(getWeightFromPackage('bar')(pkg)).toBe(69);
    });

    test('supports `nested.properties` in `keyPath`', () => {
      const pkg = mockPackage({ 'foo.dot': 420, nested: { bar: 69 } });

      expect(getWeightFromPackage('foo\\.dot')(pkg)).toBe(420);
      expect(getWeightFromPackage('nested.bar')(pkg)).toBe(69);
    });
  });

  describe('`defaultValue`', () => {
    test('sets default for missing properties', () => {
      const pkg = mockPackage();

      expect(getWeightFromPackage('foo')(pkg)).toBe(1);
      expect(getWeightFromPackage('foo\\.dot')(pkg)).toBe(1);
      expect(getWeightFromPackage('nested.bar')(pkg)).toBe(1);
    });

    test('accepts configurable default for missing properties', () => {
      const pkg = mockPackage();
      const opts = { defaultValue: 42 };

      expect(getWeightFromPackage('foo', opts)(pkg)).toBe(42);
      expect(getWeightFromPackage('foo\\.dot', opts)(pkg)).toBe(42);
      expect(getWeightFromPackage('nested.bar', opts)(pkg)).toBe(42);
    });
  });

  describe('validation', () => {
    test('rejects invalid types', () => {
      const pkg = mockPackage({
        null: null,
        string: 'string',
        true: true,
        false: false,
        array: [],
        object: {}
      });

      for (const key of Object.keys(pkg.toJSON())) {
        expect(() => getWeightFromPackage(key)(pkg)).toThrow(AssertionError);
      }
    });

    describe('`min`, `max`', () => {
      const pkg = mockPackage({
        negative: -1,
        zero: 0,
        one: 1,
        seven: 7,
        ten: 10,
        eleven: 11,
        infinity: Number.POSITIVE_INFINITY
      });

      test('default range: `[0, Infinity]`', () => {
        // To small
        expect(() => getWeightFromPackage('negative')(pkg)).toThrow(
          AssertionError
        );

        // In range
        expect(getWeightFromPackage('zero')(pkg)).toBe(0);
        expect(getWeightFromPackage('one')(pkg)).toBe(1);
        expect(getWeightFromPackage('seven')(pkg)).toBe(7);
        expect(getWeightFromPackage('ten')(pkg)).toBe(10);
        expect(getWeightFromPackage('eleven')(pkg)).toBe(11);
        expect(getWeightFromPackage('infinity')(pkg)).toBe(
          Number.POSITIVE_INFINITY
        );
      });

      test('configurable range', () => {
        const opts = { min: 7, max: 10 };

        // Too small
        expect(() => getWeightFromPackage('negative', opts)(pkg)).toThrow(
          AssertionError
        );
        expect(() => getWeightFromPackage('zero', opts)(pkg)).toThrow(
          AssertionError
        );
        expect(() => getWeightFromPackage('one', opts)(pkg)).toThrow(
          AssertionError
        );

        // In range
        expect(getWeightFromPackage('seven', opts)(pkg)).toBe(7);
        expect(getWeightFromPackage('ten', opts)(pkg)).toBe(10);

        // Too big
        expect(() => getWeightFromPackage('eleven', opts)(pkg)).toThrow(
          AssertionError
        );
        expect(() => getWeightFromPackage('infinity', opts)(pkg)).toThrow(
          AssertionError
        );
      });
    });
  });
});
