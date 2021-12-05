/* globals afterEach,beforeEach,describe,expect,it,jest */

import * as React from 'react';
import { deepEqual } from '../src/index';

import {
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createCircularEqualCreator,
  getNewCache,
  getNewCacheFallback,
  isPlainObject,
  isPromiseLike,
  isReactElement,
  sameValueZeroEqual,
} from '../src/utils';

import {
  alternativeValues,
  mainValues,
  primitiveValues,
} from './__helpers__/dataTypes';

describe('areArraysEqual', () => {
  it('should return false when the arrays are different lengths', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar', 'baz'];
    const cache = new WeakSet();

    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the arrays are not equal in value', () => {
    const a = ['foo', 'bar'];
    const cache = new WeakSet();

    const b = ['foo', 'baz'];
    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the arrays are equal in value', () => {
    const a = ['foo', 'bar'];
    const b = ['foo', 'bar'];
    const cache = new WeakSet();

    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });
});

describe('areMapsEqual', () => {
  it('should return false when maps are different sizes', () => {
    const a = new Map();
    const b = new Map().set('foo', 'bar');
    const cache = new WeakSet();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when maps have different keys', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('bar', 'bar');
    const cache = new WeakSet();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when maps have different values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'baz');
    const cache = new WeakSet();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when maps have the same size, keys, and values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'bar');
    const cache = new WeakSet();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it('should return true when maps have the same size, keys, and values regardless of order', () => {
    const a = new Map().set('bar', 'foo').set('foo', 'bar');
    const b = new Map().set('foo', 'bar').set('bar', 'foo');
    const cache = new WeakSet();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it('should handle duplicate but equal `Map` entries', () => {
      const mapA = new Map<any, any>([
        [{ b: 'c' }, 2],
        [{ b: 'c' }, 2],
      ]);
      const mapB = new Map<any, any>([
        [{ b: 'c' }, 2],
        [{ b: 'c' }, 2],
      ]);
      const cache = new WeakSet();

      const result = areMapsEqual(mapA, mapB, deepEqual, cache);

      expect(result).toBe(true);
    });

    it('should handle the first `Map` entry being unequal', () => {
      const mapA = new Map<any, any>([
        [{ b: 'c' }, 2],
        [{ b: 'c' }, 2],
      ]);
      const mapB = new Map<any, any>([
        ['foo', 'different'],
        [{ b: 'c' }, 2],
      ]);
      const cache = new WeakSet();

      const result = areMapsEqual(mapA, mapB, deepEqual, cache);

      expect(result).toBe(false);
    });

    it('should handle the last `Map` entry being unequal', () => {
      const mapA = new Map<any, any>([
        [{ b: 'c' }, 2],
        [{ b: 'c' }, 2],
      ]);
      const mapB = new Map<any, any>([
        [{ b: 'c' }, 2],
        ['foo', 'different'],
      ]);
      const cache = new WeakSet();

      const result = areMapsEqual(mapA, mapB, deepEqual, cache);

      expect(result).toBe(false);
    });

    it('should handle an intermediary `Map` entry being unequal', () => {
      const mapA = new Map<any, any>([
        ['foo', 'different'],
        [{ b: 'c' }, 2],
        [{ b: 'c' }, 2],
      ]);
      const mapB = new Map<any, any>([
        ['foo', 'different'],
        ['foo', 'different'],
        [{ b: 'c' }, 2],
      ]);
      const cache = new WeakSet();

      const result = areMapsEqual(mapA, mapB, deepEqual, cache);

      expect(result).toBe(false);
    });
  });
});

describe('areObjectsEqual', () => {
  it('should return false when the objects have different key lengths', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', baz: 'baz', foo: 'foo' };
    const cache = new WeakSet();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the objects have different keys', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { baz: 'bar', foo: 'foo' };
    const cache = new WeakSet();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the objects are not equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'baz', foo: 'foo' };
    const cache = new WeakSet();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the objects are equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', foo: 'foo' };
    const cache = new WeakSet();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
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
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the sets have different values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('bar');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the sets have the same values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('foo');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it('should return true when the sets have the same values regardless of order', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar').add('foo');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it('should handle duplicate but equal `Set` entries', () => {
      const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
      const setB = new Set<any>([{ b: 'c' }, { b: 'c' }]);
      const cache = new WeakSet();

      const result = areSetsEqual(setA, setB, deepEqual, cache);

      expect(result).toBe(true);
    });

    it('should handle the first `Set` entry being unequal', () => {
      const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
      const setB = new Set<any>(['foo', { b: 'c' }]);
      const cache = new WeakSet();

      const result = areSetsEqual(setA, setB, deepEqual, cache);

      expect(result).toBe(false);
    });

    it('should handle the last `Set` entry being unequal', () => {
      const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
      const setB = new Set<any>([{ b: 'c' }, 'foo']);
      const cache = new WeakSet();

      const result = areSetsEqual(setA, setB, deepEqual, cache);

      expect(result).toBe(false);
    });

    it('should handle an intermediary `Set` entry being unequal', () => {
      const setA = new Set<any>(['foo', { b: 'c' }, { b: 'c' }]);
      const setB = new Set<any>(['foo', 'foo', { b: 'c' }]);
      const cache = new WeakSet();

      const result = areSetsEqual(setA, setB, deepEqual, cache);

      expect(result).toBe(false);
    });
  });
});

describe('createCircularEqualCreator', () => {
  it('should create the custom comparator that stores the values in cache', () => {
    const ws = global.WeakSet;

    const values: any[] = [];

    const add = jest.fn().mockImplementation((object) => values.push(object));
    const has = jest
      .fn()
      .mockImplementation((object) => values.indexOf(object) !== -1);

    // @ts-ignore
    global.WeakSet = function WeakSet() {
      this._values = values;

      this.add = add;
      this.has = has;
    };

    const handler = createCircularEqualCreator(undefined);

    const isDeepEqual = jest.fn().mockReturnValue(true);

    const comparator = handler(isDeepEqual);

    const a = { foo: 'bar' };
    const b = { foo: 'bar' };

    const result = comparator(a, a);

    expect(has).toHaveBeenCalledTimes(2);
    expect(has).toHaveBeenNthCalledWith(1, a);
    expect(has).toHaveBeenNthCalledWith(2, b);

    has.mockClear();

    expect(add).toHaveBeenCalledTimes(2);
    expect(add).toHaveBeenNthCalledWith(1, a);
    expect(add).toHaveBeenNthCalledWith(2, b);

    add.mockClear();

    expect(result).toBe(true);

    comparator(a, b);

    expect(has).toHaveBeenCalledTimes(2);
    expect(has).toHaveBeenNthCalledWith(1, a);
    expect(has).toHaveBeenNthCalledWith(2, b);

    expect(add).not.toHaveBeenCalled();

    global.WeakSet = ws;
  });
});

describe('getNewCache', () => {
  it('should return a new WeakSet when support is present', () => {
    const cache = getNewCache();

    expect(cache).toBeInstanceOf(WeakSet);
  });

  it('should work the same with the fallback when WeakSet is not supported', () => {
    const cache = getNewCacheFallback();

    expect(cache).not.toBeInstanceOf(WeakSet);

    const value = { foo: 'bar' };

    expect(cache.has(value)).toBe(false);

    cache.add(value);

    expect(cache.has(value)).toBe(true);
  });
});

describe('isReactElement', () => {
  it('should return true if the appropriate keys are present and truthy', () => {
    const div = React.createElement('div', {}, 'foo');

    expect(isReactElement(div)).toBe(true);
  });

  it('should return false if the appropriate keys are not present', () => {
    const div = { foo: 'bar' };

    expect(isReactElement(div)).toBe(false);
  });
});

describe('isPlainObject', () => {
  it('should return true when a plain object', () => {
    const a = {};

    expect(isPlainObject(a)).toBe(true);
  });

  it('should return true when a pure object', () => {
    const a = Object.create(null);

    expect(isPlainObject(a)).toBe(true);
  });

  it('should return false when not a standard object', () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
  });

  it('should return true when an object made via Object.create()', () => {
    const a = Object.create({ foo: 'bar' });

    expect(isPlainObject(a)).toBe(true);
  });
});

describe('isPromiseLike', () => {
  it('should return true when the object is thenable', () => {
    const a = { then() {} };

    expect(isPromiseLike(a)).toBe(true);
  });

  it('should return false when the object has a then but is not a function', () => {
    const a = { then: 'again' };

    expect(isPromiseLike(a)).toBe(false);
  });
});

describe('isSameValueZero', () => {
  Object.keys(primitiveValues).forEach((key: keyof typeof primitiveValues) => {
    it(`should have ${key} be equal by SameValueZero`, () => {
      expect(sameValueZeroEqual(primitiveValues[key], mainValues[key])).toBe(
        true,
      );
    });
  });

  Object.keys(mainValues).forEach((key: keyof typeof mainValues) => {
    if (!Object.prototype.hasOwnProperty.call(primitiveValues, key)) {
      it(`should have ${key} be equal by SameValueZero`, () => {
        // @ts-ignore
        expect(sameValueZeroEqual(mainValues[key], mainValues[key])).toBe(true);
      });
    }
  });

  Object.keys(alternativeValues).forEach(
    (key: keyof typeof alternativeValues) => {
      if (Object.prototype.hasOwnProperty.call(mainValues, key)) {
        it(`should have ${key} not be equal by SameValueZero`, () => {
          expect(
            sameValueZeroEqual(alternativeValues[key], mainValues[key]),
          ).toBe(false);
        });
      }
    },
  );
});
