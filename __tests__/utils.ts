/* globals afterEach,beforeEach,describe,expect,it,jest */

import * as React from 'react';

import {
  addToCache,
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createCircularIsEqualCreator,
  getNewCache,
  getNewCacheFallback,
  hasPair,
  hasValue,
  isPlainObject,
  isPromiseLike,
  isReactElement,
  sameValueZeroEqual,
  toPairs,
  toValues,
} from '../src/utils';

import {
  alternativeValues,
  mainValues,
  primitiveValues,
} from './__helpers__/dataTypes';

describe('addToCache', () => {
  it('should not add the item to cache if it is null', () => {
    const object: null = null;
    const cache = new WeakSet();

    addToCache(object, cache);

    expect(cache.has(object)).toBe(false);
  });

  it('should not add the item to cache if it is not an object', () => {
    const object = 'foo';
    const cache = new WeakSet();

    addToCache(object, cache);

    expect(cache.has(object as {})).toBe(false);
  });

  it('should add the item to cache if it is an object', () => {
    const object = { foo: 'bar' };
    const cache = new WeakSet();

    addToCache(object, cache);

    expect(cache.has(object)).toBe(true);
  });
});

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
  it('should return false when the objects have different sizes', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the objects have different values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('bar');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the objects have the same values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('foo');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it('should return true when the objects have the same values regardless of order', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar').add('foo');
    const cache = new WeakSet();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });
});

describe('createCircularIsEqualCreator', () => {
  it('should create the custom comparator that stores the values in cache', () => {
    const ws = global.WeakSet;

    const values: any[] = [];

    const add = jest.fn().mockImplementation(object => values.push(object));
    const has = jest
      .fn()
      .mockImplementation(object => values.indexOf(object) !== -1);

    // @ts-ignore
    global.WeakSet = function WeakSet() {
      this._values = values;

      this.add = add;
      this.has = has;
    };

    const handler = createCircularIsEqualCreator(undefined);

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

    const proto = Object.getPrototypeOf(cache);

    expect(proto._values).toEqual([]);
    expect(typeof proto.add).toBe('function');
    expect(typeof proto.has).toBe('function');

    const value = { foo: 'bar' };

    expect(cache.has(value)).toBe(false);

    cache.add(value);

    expect(cache.has(value)).toBe(true);
    expect(proto._values).toEqual([value]);
  });
});

describe('hasPair', () => {
  it('should return true if the pair exists in the array', () => {
    const pairs: [string, string][] = [
      ['foo', 'bar'],
      ['bar', 'baz'],
      ['baz', 'quz'],
    ];
    const pair = pairs[1];
    const meta: void = undefined;

    expect(hasPair(pairs, pair, sameValueZeroEqual, meta)).toBe(true);
  });

  it('should return false if the pair does not exist in the array due to key', () => {
    const pairs: [string, string][] = [
      ['foo', 'bar'],
      ['rab', 'baz'],
      ['baz', 'quz'],
    ];
    const pair: [string, string] = ['bar', 'baz'];
    const meta: void = undefined;

    expect(hasPair(pairs, pair, sameValueZeroEqual, meta)).toBe(false);
  });

  it('should return false if the pair does not exist in the array due to value', () => {
    const pairs: [string, string][] = [
      ['foo', 'bar'],
      ['bar', 'zab'],
      ['baz', 'quz'],
    ];
    const pair: [string, string] = ['bar', 'baz'];
    const meta: void = undefined;

    expect(hasPair(pairs, pair, sameValueZeroEqual, meta)).toBe(false);
  });
});

describe('hasValue', () => {
  it('should return true if the key exists in the array', () => {
    const keys = ['foo', 'bar', 'baz'];
    const key = keys[1];
    const meta: void = undefined;

    expect(hasValue(keys, key, sameValueZeroEqual, meta)).toBe(true);
  });

  it('should return true if the key does not exist in the array', () => {
    const keys = ['foo', 'bar', 'baz'];
    const key = 'quz';
    const meta: void = undefined;

    expect(hasValue(keys, key, sameValueZeroEqual, meta)).toBe(false);
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

describe('toPairs', () => {
  it('should convert the map into [key, value] pairs', () => {
    const map = new Map().set('foo', 'bar').set('bar', 'baz');

    expect(toPairs(map)).toEqual([['foo', 'bar'], ['bar', 'baz']]);
  });
});

describe('toValues', () => {
  it('should convert the set into values array', () => {
    const set = new Set().add('foo').add('bar');

    expect(toValues(set)).toEqual(['foo', 'bar']);
  });
});
