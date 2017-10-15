// test
import test from 'ava';

// src
import createComparator from 'src/comparator';

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
  const createIsEqual = () => {
    return (a, b) => {
      return a === b;
    };
  };

  const comparator = createComparator(createIsEqual);

  const objectA = {foo: {bar: 'baz'}};
  const objectB = {foo: {bar: 'baz'}};

  t.false(comparator(objectA, objectB));
});
