// test
import test from 'ava';
import {alternativeValues, mainValues} from 'test/helpers/dataTypes';

// src
import * as utils from 'src/utils';

test('if isFunction will return true for a function, false otherwise', (t) => {
  Object.keys(mainValues).forEach((key) => {
    t[key === 'fn'](utils.isFunction(mainValues[key]));
  });
});

test('if isNAN will return true for a NaN, false otherwise', (t) => {
  Object.keys(mainValues).forEach((key) => {
    t[key === 'nan'](utils.isNAN(mainValues[key]));
  });
});

test('if createIsStrictlyEqual will return true when strictly equal, false otherwise', (t) => {
  Object.keys(mainValues).forEach((key) => {
    t[key !== 'nan'](utils.createIsStrictlyEqual()(mainValues[key], mainValues[key]), `${key} - true`);

    if (alternativeValues.hasOwnProperty(key)) {
      t.false(utils.createIsStrictlyEqual()(mainValues[key], alternativeValues[key]), `${key} - false`);
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
