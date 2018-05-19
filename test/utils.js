// test
import test from 'ava';
import sinon from 'sinon';
import {alternativeValues, mainValues} from 'test/helpers/dataTypes';
import React from 'react';

// src
import * as utils from 'src/utils';
import * as constants from 'src/constants';
import {createCircularEqual} from '../src/utils';

test('if addObjectToCache will not add the item to cache if it is null', (t) => {
  const object = null;
  const cache = new WeakSet();

  utils.addObjectToCache(object, cache);

  t.false(cache.has(object));
});

test('if addObjectToCache will not add the item to cache if it is not an object', (t) => {
  const object = 'foo';
  const cache = new WeakSet();

  utils.addObjectToCache(object, cache);

  t.false(cache.has(object));
});

test('if addObjectToCache will add the item to cache if it is an object', (t) => {
  const object = {foo: 'bar'};
  const cache = new WeakSet();

  utils.addObjectToCache(object, cache);

  t.true(cache.has(object));
});

test('if areArraysEqual returns false when the arrays are different lengths', (t) => {
  const arrayA = ['foo', 'bar'];
  const arrayB = ['foo', 'bar', 'baz'];
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.false(utils.areArraysEqual(arrayA, arrayB, isEqual, cache));
});

test('if areArraysEqual returns false when the arrays are not equal in value', (t) => {
  const arrayA = ['foo', 'bar'];
  const arrayB = ['foo', 'baz'];
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.false(utils.areArraysEqual(arrayA, arrayB, isEqual, cache));
});

test('if areArraysEqual returns true when the arrays are equal in value', (t) => {
  const arrayA = ['foo', 'bar'];
  const arrayB = ['foo', 'bar'];
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.true(utils.areArraysEqual(arrayA, arrayB, isEqual, cache));
});

test('if areIterablesEqual returns false when objects are different sizes', (t) => {
  const objectA = new Map();
  const objectB = new Map().set('foo', 'bar');
  const cache = new WeakSet();
  const comparator = (a, b) => a === b;

  t.false(utils.createAreIterablesEqual(true)(objectA, objectB, comparator, cache));
});

test('if areIterablesEqual returns false when objects have different keys', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('bar', 'baz');
  const cache = new WeakSet();
  const comparator = (a, b) => a === b;

  t.false(utils.createAreIterablesEqual(true)(objectA, objectB, comparator, cache));
});

test('if areIterablesEqual returns false when objects have different values', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('foo', 'baz');
  const cache = new WeakSet();
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.false(utils.createAreIterablesEqual(true)(objectA, objectB, comparator, cache));
});

test('if areIterablesEqual returns true when objects have the same size, keys, and values', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('foo', 'bar');
  const cache = new WeakSet();
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.true(utils.createAreIterablesEqual(true)(objectA, objectB, comparator, cache));
});

test('if areIterablesEqual returns false when objects have the same size but different values when they are sets', (t) => {
  const objectA = new Set().add('foo');
  const objectB = new Set().add('bar');
  const cache = new WeakSet();
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.false(utils.createAreIterablesEqual(false)(objectA, objectB, comparator, cache));
});

test('if areIterablesEqual returns true when objects have the same size and values when they are sets', (t) => {
  const objectA = new Set().add('bar');
  const objectB = new Set().add('bar');
  const cache = new WeakSet();
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.true(utils.createAreIterablesEqual(false)(objectA, objectB, comparator, cache));
});

test('if areObjectsEqual returns false when the object have different key lengths', (t) => {
  const objectA = {foo: 'foo', bar: 'bar'};
  const objectB = {foo: 'foo', bar: 'bar', baz: 'baz'};
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.false(utils.areObjectsEqual(objectA, objectB, isEqual, cache));
});

test('if areObjectsEqual returns false when the objects are not equal in value', (t) => {
  const objectA = {foo: 'foo', bar: 'bar'};
  const objectB = {foo: 'foo', bar: 'baz'};
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.false(utils.areObjectsEqual(objectA, objectB, isEqual, cache));
});

test('if areObjectsEqual returns true when the objects are equal in value', (t) => {
  const objectA = {foo: 'foo', bar: 'bar'};
  const objectB = {foo: 'foo', bar: 'bar'};
  const isEqual = (a, b) => a === b;
  const cache = new WeakSet();

  t.true(utils.areObjectsEqual(objectA, objectB, isEqual, cache));
});

test('if areRegExpsEqual returns false if the source values are different', (t) => {
  const regExpA = new RegExp('foo');
  const regExpB = new RegExp('bar');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns false if the global flag is different', (t) => {
  const regExpA = new RegExp('foo', 'g');
  const regExpB = new RegExp('foo');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns false if the ignoreCase flag is different', (t) => {
  const regExpA = new RegExp('foo', 'i');
  const regExpB = new RegExp('foo');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns false if the multiline flag is different', (t) => {
  const regExpA = new RegExp('foo', 'm');
  const regExpB = new RegExp('foo');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns false if the unicode flag is different', (t) => {
  const regExpA = new RegExp('\u{61}', 'u');
  const regExpB = new RegExp('\u{61}');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns false if the sticky flag is different', (t) => {
  const regExpA = new RegExp('foo', 'y');
  const regExpB = new RegExp('foo');

  t.false(utils.areRegExpsEqual(regExpA, regExpB));
});

test('if areRegExpsEqual returns true if the values and flags are equal', (t) => {
  const regExpA = new RegExp('foo', 'gi');
  const regExpB = new RegExp('foo', 'ig');

  t.true(utils.areRegExpsEqual(regExpA, regExpB));
});

test.serial('if createCircularEqual will create the custom comparator that stores the values in cache', (t) => {
  const isEqual = undefined;

  const ws = global.WeakSet;

  const values = [];
  const add = sinon.stub().callsFake((object) => values.push(object));
  const has = sinon.stub().callsFake((object) => !!~values.indexOf(object));

  global.WeakSet = function WeakSet() {
    this._values = values;

    this.add = add;
    this.has = has;
  };

  const handler = createCircularEqual(isEqual);

  const isDeepEqual = sinon.stub().returns(true);

  const comparator = handler(isDeepEqual);

  const objectA = {foo: 'bar'};
  const objectB = {foo: 'bar'};

  const result = comparator(objectA, objectB);

  t.true(has.calledTwice);
  t.deepEqual(has.args, [[objectA], [objectB]]);

  t.true(add.calledTwice);
  t.deepEqual(add.args, [[objectA], [objectB]]);

  t.true(result);

  has.resetHistory();
  add.resetHistory();

  comparator(objectA, objectB);

  t.true(has.calledTwice);
  t.deepEqual(has.args, [[objectA], [objectB]]);

  t.true(add.notCalled);

  global.WeakSet = ws;
});

test.serial('if getNewCache will return a new WeakSet when support is present', (t) => {
  const result = utils.getNewCache();

  t.true(result instanceof WeakSet);
});

test.serial('if getNewCache will return a new WeakSet-like object when support is not present', (t) => {
  const support = constants.HAS_WEAKSET_SUPPORT;

  constants.HAS_WEAKSET_SUPPORT = false;

  const result = utils.getNewCache();

  t.false(result instanceof WeakSet);
  t.deepEqual(result._values, []);

  const value = {foo: 'bar'};

  result.add(value);

  t.deepEqual(result._values, [value]);
  t.true(result.has(value));

  constants.HAS_WEAKSET_SUPPORT = support;
});

test('if hasKey returns true if the key does exists in the array', (t) => {
  const keys = ['foo', 'bar', 'baz'];
  const key = 'bar';

  t.true(utils.hasKey(keys, key));
});

test('if hasKey returns false if the key does not exist in the array', (t) => {
  const keys = ['foo', 'bar', 'baz'];
  const key = 'quz';

  t.false(utils.hasKey(keys, key));
});

test('if isCircularReactElement will return true if the appropriate keys are present and truthy', (t) => {
  const div = React.createElement('div', {children: 'foo'});

  t.true(utils.isReactElement(div));
});

test('if isCircularReactElement will return false if the appropriate keys are not present and truthy', (t) => {
  const div = {
    foo: 'bar'
  };

  t.false(utils.isReactElement(div));
});

test('if isPlainObject returns false when the object is not a plain object', (t) => {
  const objects = [true, 'foo', 123];

  objects.forEach((object) => {
    t.false(utils.isPlainObject(object));
  });
});

test('if isPlainObject returns true when the object is a plain object', (t) => {
  t.true(utils.isPlainObject({}));
});

test('if isPromiseLike returns true when there is a then function on the object', (t) => {
  const object = {
    then() {}
  };

  t.true(utils.isPromiseLike(object));
});

test('if isPromiseLike returns false when there is no then function on the object', (t) => {
  const object = {
    then: 'again'
  };

  t.false(utils.isPromiseLike(object));
});

test('if sameValueZeroEqual will return true when strictly equal or NaN, false otherwise', (t) => {
  Object.keys(mainValues).forEach((key) => {
    t.true(utils.sameValueZeroEqual(mainValues[key], mainValues[key]), `${key} - true`);

    if (alternativeValues.hasOwnProperty(key)) {
      t.false(utils.sameValueZeroEqual(mainValues[key], alternativeValues[key]), `${key} - false`);
    }
  });
});

test('if toPairs will convert the map into {keys: [], values: []} pairs', (t) => {
  const map = new Map().set('foo', 'bar').set('bar', 'baz');

  const result = utils.toPairs(map);

  t.deepEqual(result, {
    keys: ['foo', 'bar'],
    values: ['bar', 'baz']
  });
});

test('if toPairs will convert the set into {keys: [], values: []} pairs', (t) => {
  const set = new Set().add('foo').add('bar');

  const result = utils.toPairs(set);

  t.deepEqual(result, {
    keys: ['foo', 'bar'],
    values: ['foo', 'bar']
  });
});
