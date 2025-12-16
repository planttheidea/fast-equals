import { describe, expect, test } from 'vitest';
import { areArraysEqual, areMapsEqual, areObjectsEqual, areRegExpsEqual, areSetsEqual } from '../src/equals.js';
import { deepEqual, sameValueEqual } from '../src/index.js';

const shallowState = {
  cache: undefined,
  equals: sameValueEqual,
  meta: undefined,
  strict: false,
};

const deepState = {
  ...shallowState,
  equals: deepEqual,
};

describe('areArraysEqual', () => {
  test('returnsfalse when the arrays are different lengths', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar', 'baz'];

    expect(areArraysEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when the arrays are not equal in value', () => {
    const a = ['foo', 'bar'];

    const b = ['foo', 'baz'];
    expect(areArraysEqual(a, b, shallowState)).toBe(false);
  });

  test('returnstrue when the arrays are equal in value', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar'];

    expect(areArraysEqual(a, b, shallowState)).toBe(true);
  });
});

describe('areMapsEqual', () => {
  test('returnsfalse when maps are different sizes', () => {
    const a = new Map();
    const b = new Map().set('foo', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when maps have different keys', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('bar', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when maps have different values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'baz');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnstrue when maps have the same size, keys, and values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(true);
  });

  test('returnstrue when maps have the same size, keys, and values regardless of order', () => {
    const a = new Map().set('bar', 'foo').set('foo', 'bar');
    const b = new Map().set('foo', 'bar').set('bar', 'foo');

    expect(areMapsEqual(a, b, shallowState)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    test.each([
      {
        a: [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ] as const,
        b: [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ] as const,
        expected: true,
        test: 'being different references but equal',
      },
      {
        a: [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ] as const,
        b: [
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ] as const,
        expected: false,
        test: 'being unequal based on first',
      },
      {
        a: [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ] as const,
        b: [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
        ] as const,
        expected: false,
        test: 'being unequal based on last',
      },
      {
        a: [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ] as const,
        b: [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ] as const,
        expected: false,
        test: 'being unequal based on an intermediary entry',
      },
    ])('handles `Map` entries $test', ({ a, b, expected }) => {
      const mapA = new Map<any, any>(a);
      const mapB = new Map<any, any>(b);

      expect(areMapsEqual(mapA, mapB, deepState)).toBe(expected);
      expect(areMapsEqual(mapB, mapA, deepState)).toBe(expected);
    });
  });
});

describe('areObjectsEqual', () => {
  test('returnsfalse when the objects have different key lengths', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', baz: 'baz', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when the objects have different keys', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { baz: 'bar', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when the objects are not equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'baz', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnstrue when the objects are equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(true);
  });
});

describe('areRegExpsEqual', () => {
  test('returnsfalse if the source values are different', () => {
    const a = new RegExp('foo');
    const b = new RegExp('bar');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnsfalse if the global flag is different', () => {
    const a = new RegExp('foo', 'g');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnsfalse if the ignoreCase flag is different', () => {
    const a = new RegExp('foo', 'i');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnsfalse if the multiline flag is different', () => {
    const a = new RegExp('foo', 'm');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnsfalse if the unicode flag is different', () => {
    const a = new RegExp('\u{61}', 'u');
    const b = new RegExp('\u{61}');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnsfalse if the sticky flag is different', () => {
    const a = new RegExp('foo', 'y');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  test('returnstrue if the values and flags are equal', () => {
    const a = new RegExp('foo', 'gi');
    const b = new RegExp('foo', 'ig');

    expect(areRegExpsEqual(a, b)).toBe(true);
  });
});

describe('areSetsEqual', () => {
  test('returnsfalse when the sets have different sizes', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar');

    expect(areSetsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnsfalse when the sets have different values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('bar');

    expect(areSetsEqual(a, b, shallowState)).toBe(false);
  });

  test('returnstrue when the sets have the same values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('foo');

    expect(areSetsEqual(a, b, shallowState)).toBe(true);
  });

  test('returnstrue when the sets have the same values regardless of order', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar').add('foo');

    expect(areSetsEqual(a, b, shallowState)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    test.each([
      {
        a: [{ b: 'c' }, { b: 'c' }],
        b: [{ b: 'c' }, { b: 'c' }],
        expected: true,
        test: 'being different references but equal',
      },
      {
        a: [{ b: 'c' }, { b: 'c' }],
        b: ['foo', { b: 'c' }],
        expected: false,
        test: 'being unequal based on first',
      },
      {
        a: [{ b: 'c' }, { b: 'c' }],
        b: [{ b: 'c' }, 'foo'],
        expected: false,
        test: 'being unequal based on last',
      },
      {
        a: [{ b: 'c' }, { b: 'c' }, { b: 'c' }],
        b: [{ b: 'c' }, 'foo', { b: 'c' }],
        expected: false,
        test: 'being unequal based on an intermediary entry',
      },
    ])('handles `Set` entries $test', ({ a, b, expected }) => {
      const setA = new Set<any>(a);
      const setB = new Set<any>(b);

      expect(areSetsEqual(setA, setB, deepState)).toBe(expected);
      expect(areSetsEqual(setB, setA, deepState)).toBe(expected);
    });
  });
});
