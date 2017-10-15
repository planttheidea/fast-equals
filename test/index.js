// test
import test from 'ava';
import testSuites from 'test/helpers/testSuites';

// src
import * as index from 'src/index';

const EXPORTED_METHODS = ['createCustom', 'deep', 'shallow'];

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
  const expectedNamedExportKeys = EXPORTED_METHODS.map((key) => {
    return `${key}Equal`;
  });

  t.deepEqual(namedExportKeys.sort(), expectedNamedExportKeys);

  expectedNamedExportKeys.forEach((key) => {
    t.is(typeof index[key], 'function');
  });
});

testSuites.forEach(({description: suiteDescription, tests}) => {
  tests.forEach(({deepEqual, description, shallowEqual, value1, value2}) => {
    test(`if deepEqual returns the correct value for "${suiteDescription} - ${description}"`, (t) => {
      t[deepEqual](index.deepEqual(value1, value2));
    });

    test(`if shallowEqual returns the correct value for "${suiteDescription} - ${description}"`, (t) => {
      t[shallowEqual](index.shallowEqual(value1, value2));
    });
  });
});
