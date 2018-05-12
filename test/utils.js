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

test('if areIterablesEqual returns false when objects are different sizes', (t) => {
  const objectA = new Map();
  const objectB = new Map().set('foo', 'bar');
  const comparator = (a, b) => a === b;

  t.false(utils.areIterablesEqual(objectA, objectB, comparator, true));
});

test('if areIterablesEqual returns false when objects have different keys', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('bar', 'baz');
  const comparator = (a, b) => a === b;

  t.false(utils.areIterablesEqual(objectA, objectB, comparator, true));
});

test('if areIterablesEqual returns false when objects have different values', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('foo', 'baz');
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.false(utils.areIterablesEqual(objectA, objectB, comparator, true));
});

test('if areIterablesEqual returns true when objects have the same size, keys, and values', (t) => {
  const objectA = new Map().set('foo', 'bar');
  const objectB = new Map().set('foo', 'bar');
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.true(utils.areIterablesEqual(objectA, objectB, comparator, true));
});

test('if areIterablesEqual returns false when objects have the same size but different values when they are sets', (t) => {
  const objectA = new Set().add('foo');
  const objectB = new Set().add('bar');
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.false(utils.areIterablesEqual(objectA, objectB, comparator, false));
});

test('if areIterablesEqual returns true when objects have the same size and values when they are sets', (t) => {
  const objectA = new Set().add('bar');
  const objectB = new Set().add('bar');
  const comparator = (a, b) => a.length === b.length && a.every((value, index) => b[index] === value);

  t.true(utils.areIterablesEqual(objectA, objectB, comparator, false));
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
