// test
import test from 'ava';

// src
import createComparator from 'src/comparator';
import * as constants from 'src/constants';

test('if createComparator creates a comparator function', (t) => {
  const result = createComparator();

  t.is(typeof result, 'function');
});

test('if comparator will default to a deep equal setup when no isEqual method is passed', (t) => {
  const comparator = createComparator();

  const objectA = {foo: {bar: 'baz'}};
  const objectB = {foo: {bar: 'baz'}};

  t.true(comparator(objectA, objectB));
});

test('if comparator will use the custom setup when an equality check creator is passed', (t) => {
  const createIsEqual = () => (a, b) => a === b;

  const comparator = createComparator(createIsEqual);

  const objectA = {foo: {bar: 'baz'}};
  const objectB = {foo: {bar: 'baz'}};

  t.false(comparator(objectA, objectB));
});

test('if comparator will handle when there is no map or set support', (t) => {
  const comparator = createComparator();

  const mapSupport = constants.HAS_MAP_SUPPORT;
  const setSupport = constants.HAS_SET_SUPPORT;

  constants.HAS_MAP_SUPPORT = false;
  constants.HAS_SET_SUPPORT = false;

  const objectA = new Error('boom');
  const objectB = new Error('boom');

  t.true(comparator(objectA, objectB));

  constants.HAS_MAP_SUPPORT = mapSupport;
  constants.HAS_SET_SUPPORT = setSupport;
});
