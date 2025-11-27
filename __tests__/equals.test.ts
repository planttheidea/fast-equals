import { describe, expect, it } from 'vitest';
import { areArraysEqual, areMapsEqual, areObjectsEqual, areRegExpsEqual, areSetsEqual } from '../src/equals.js';
import { deepEqual } from '../src/index.js';
import { sameValueZeroEqual } from '../src/utils.js';

const shallowState = {
  cache: undefined,
  equals: sameValueZeroEqual,
  meta: undefined,
  strict: false,
};

const deepState = {
  ...shallowState,
  equals: deepEqual,
};

describe('areArraysEqual', () => {
  it('should return false when the arrays are different lengths', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar', 'baz'];

    expect(areArraysEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when the arrays are not equal in value', () => {
    const a = ['foo', 'bar'];

    const b = ['foo', 'baz'];
    expect(areArraysEqual(a, b, shallowState)).toBe(false);
  });

  it('should return true when the arrays are equal in value', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar'];

    expect(areArraysEqual(a, b, shallowState)).toBe(true);
  });
});

describe('areMapsEqual', () => {
  it('should return false when maps are different sizes', () => {
    const a = new Map();
    const b = new Map().set('foo', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when maps have different keys', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('bar', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when maps have different values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'baz');

    expect(areMapsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return true when maps have the same size, keys, and values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'bar');

    expect(areMapsEqual(a, b, shallowState)).toBe(true);
  });

  it('should return true when maps have the same size, keys, and values regardless of order', () => {
    const a = new Map().set('bar', 'foo').set('foo', 'bar');
    const b = new Map().set('foo', 'bar').set('bar', 'foo');

    expect(areMapsEqual(a, b, shallowState)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it.each([
      [
        'being different references but equal',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        true,
      ],
      [
        'being unequal based on first',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ],
        false,
      ],
      [
        'being unequal based on last',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
        ],
        false,
      ],
      [
        'being unequal based on an intermediary entry',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ],
        false,
      ],
    ])('should handle `Map` entries %s', (_, aEntries: any[], bEntries: any[], expected) => {
      const mapA = new Map<any, any>(aEntries);
      const mapB = new Map<any, any>(bEntries);

      expect(areMapsEqual(mapA, mapB, deepState)).toBe(expected);
      expect(areMapsEqual(mapB, mapA, deepState)).toBe(expected);
    });
  });
});

describe('areObjectsEqual', () => {
  it('should return false when the objects have different key lengths', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', baz: 'baz', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when the objects have different keys', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { baz: 'bar', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when the objects are not equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'baz', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return true when the objects are equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', foo: 'foo' };

    expect(areObjectsEqual(a, b, shallowState)).toBe(true);
  });
});

describe('areRegExpsEqual', () => {
  it('should return false if the source values are different', () => {
    const a = new RegExp('foo');
    const b = new RegExp('bar');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the global flag is different', () => {
    const a = new RegExp('foo', 'g');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the ignoreCase flag is different', () => {
    const a = new RegExp('foo', 'i');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the multiline flag is different', () => {
    const a = new RegExp('foo', 'm');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the unicode flag is different', () => {
    const a = new RegExp('\u{61}', 'u');
    const b = new RegExp('\u{61}');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return false if the sticky flag is different', () => {
    const a = new RegExp('foo', 'y');
    const b = new RegExp('foo');

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it('should return true if the values and flags are equal', () => {
    const a = new RegExp('foo', 'gi');
    const b = new RegExp('foo', 'ig');

    expect(areRegExpsEqual(a, b)).toBe(true);
  });
});

describe('areSetsEqual', () => {
  it('should return false when the sets have different sizes', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar');

    expect(areSetsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return false when the sets have different values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('bar');

    expect(areSetsEqual(a, b, shallowState)).toBe(false);
  });

  it('should return true when the sets have the same values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('foo');

    expect(areSetsEqual(a, b, shallowState)).toBe(true);
  });

  it('should return true when the sets have the same values regardless of order', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar').add('foo');

    expect(areSetsEqual(a, b, shallowState)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it.each([
      ['being different references but equal', [{ b: 'c' }, { b: 'c' }], [{ b: 'c' }, { b: 'c' }], true],
      ['being unequal based on first', [{ b: 'c' }, { b: 'c' }], ['foo', { b: 'c' }], false],
      ['being unequal based on last', [{ b: 'c' }, { b: 'c' }], [{ b: 'c' }, 'foo'], false],
      [
        'being unequal based on an intermediary entry',
        [{ b: 'c' }, { b: 'c' }, { b: 'c' }],
        [{ b: 'c' }, 'foo', { b: 'c' }],
        false,
      ],
    ])('should handle `Set` entries %s', (_, aEntries, bEntries, expected) => {
      const setA = new Set<any>(aEntries);
      const setB = new Set<any>(bEntries);

      expect(areSetsEqual(setA, setB, deepState)).toBe(expected);
      expect(areSetsEqual(setB, setA, deepState)).toBe(expected);
    });
  });
});
