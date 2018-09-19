// test
import test from 'ava';
import testSuites from 'test/helpers/testSuites';

// src
import * as index from 'src/index';

const EXPORTED_METHODS = ['circularDeep', 'circularShallow', 'createCustom', 'deep', 'sameValueZero', 'shallow'];

test('if the default export has the correct properties', (t) => {
  const defaultExportKeys = Object.keys(index.default);

  t.deepEqual(defaultExportKeys.sort(), EXPORTED_METHODS);

  defaultExportKeys.forEach((key) => {
    t.is(typeof index.default[key], 'function');
  });
});

test('if there are named exports for each equality method', (t) => {
  const {__esModule: esModuleIgnored, default: defaultIgnored, ...namedExports} = index;

  const namedExportKeys = Object.keys(namedExports);
  const expectedNamedExportKeys = EXPORTED_METHODS.map((key) => `${key}Equal`);

  t.deepEqual(namedExportKeys.sort(), expectedNamedExportKeys);

  expectedNamedExportKeys.forEach((key) => {
    t.is(typeof index[key], 'function');
  });
});

testSuites.forEach(({description: suiteDescription, tests}, testSuiteIndex) => {
  tests.forEach(({deepEqual, description, shallowEqual, value1, value2}, testIndex) => {
    test(`if deepEqual returns the correct value for "${suiteDescription} - ${description}" (Suite ${testSuiteIndex}, test ${testIndex})`, (t) => {
      t[deepEqual](index.deepEqual(value1, value2));
    });

    test(`if circularDeepEqual returns the correct deepEqual  value for "${suiteDescription} - ${description}" (Suite ${testSuiteIndex}, test ${testIndex})`, (t) => {
      t[deepEqual](index.circularDeepEqual(value1, value2));
    });

    test(`if shallowEqual returns the correct value for "${suiteDescription} - ${description}" (Suite ${testSuiteIndex}, test ${testIndex})`, (t) => {
      t[shallowEqual](index.shallowEqual(value1, value2));
    });

    test(`if circularShallowEqual returns the correct shallowEqual  value for "${suiteDescription} - ${description}" (Suite ${testSuiteIndex}, test ${testIndex})`, (t) => {
      t[shallowEqual](index.circularShallowEqual(value1, value2));
    });
  });
});

test('if circularDeepEqual handles deeply nested circular objects', (t) => {
  function Circular(value) {
    this.me = {
      deeply: {
        nested: {
          reference: this,
        },
      },
      value,
    };
  }

  t.true(index.circularDeepEqual(new Circular('foo'), new Circular('foo')));
  t.false(index.circularDeepEqual(new Circular('foo'), new Circular('bar')));
});

test('if circularShallowEqual handles shallowly nested circular objects', (t) => {
  const array = ['foo'];

  array.push(array);

  t.true(index.circularShallowEqual(array, ['foo', array]));
  t.false(index.circularShallowEqual(array, [array]));
});
