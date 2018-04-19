// test
import test from 'ava';
import {alternativeValues, mainValues} from 'test/helpers/dataTypes';
import React from 'react';

// src
import * as utils from 'src/utils';

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

test('if createIsSameValueZero will return true when strictly equal or NaN, false otherwise', (t) => {
  Object.keys(mainValues).forEach((key) => {
    t.true(utils.createIsSameValueZero()(mainValues[key], mainValues[key]), `${key} - true`);

    if (alternativeValues.hasOwnProperty(key)) {
      t.false(utils.createIsSameValueZero()(mainValues[key], alternativeValues[key]), `${key} - false`);
    }
  });
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
