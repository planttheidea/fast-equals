/* eslint-disable @typescript-eslint/no-var-requires */

import { deepStrictEqual as assertDeepStrictEqual } from 'assert';
import tests from '../__tests__/__helpers__/testSuites.js';

import deepEql from 'deep-eql';
import deepEqual from 'deep-equal';
import fastDeepEqual from 'fast-deep-equal/es6/react.js';
import * as fe from '../dist/esm/index.mjs';
import isEqualLodash from 'lodash/isEqual.js';
import sortBy from 'lodash/sortBy.js';
import nanoEqual from 'nano-equal';
import reactFastCompare from 'react-fast-compare';
import shallowEqualFuzzy from 'shallow-equal-fuzzy';
import { isEqual as isEqualUnderscore } from 'underscore';
import { Bench } from 'tinybench';

const packages = {
  'assert.deepStrictEqual': (a, b) => {
    try {
      return assertDeepStrictEqual(a, b);
    } catch (e) {
      return false;
    }
  },
  'deep-eql': deepEql,
  'deep-equal': deepEqual,
  'fast-deep-equal': fastDeepEqual,
  'fast-equals': fe.deepEqual,
  'fast-equals (circular)': fe.circularDeepEqual,
  'fast-equals (strict)': fe.strictDeepEqual,
  'fast-equals (strict circular)': fe.strictCircularDeepEqual,
  'lodash.isEqual': isEqualLodash,
  'nano-equal': nanoEqual,
  'react-fast-compare': reactFastCompare,
  'shallow-equal-fuzzy': shallowEqualFuzzy,
  'underscore.isEqual': isEqualUnderscore,
};

console.log('');

const getPassedKey = (name, { description }) => `${name} - ${description}`;

const iterations = 1000;
const typesBenches = {};

for (const name in packages) {
  const fn = packages[name];

  const passingTests = {};

  for (const testSuite of tests) {
    let passed = true;

    for (const test of testSuite.tests) {
      try {
        if (fn(test.value1, test.value2) !== test.deepEqual) {
          console.error(
            'different result',
            name,
            testSuite.description,
            test.description,
          );

          passed = false;
        }
      } catch (e) {
        console.error(name, testSuite.description, test.description, e);

        passed = false;
      }
    }

    passingTests[getPassedKey(name, testSuite)] = passed;
  }

  for (const testSuite of tests) {
    if (!typesBenches[testSuite.description]) {
      typesBenches[testSuite.description] = new Bench({ iterations });
    }

    const typesBench = typesBenches[testSuite.description];

    typesBench.add(
      `${name} (${
        passingTests[getPassedKey(name, testSuite)] ? 'passed' : 'failed'
      })`,
      () => {
        for (const test of testSuite.tests) {
          if (
            test.description !==
            'pseudo array and equivalent array are not equal'
          ) {
            fn(test.value1, test.value2);
          }
        }
      },
    );
  }
}

async function run(name, bench) {
  console.log('');
  console.log(`Testing ${name}...`);

  await bench.run();

  const tasks = sortBy(bench.tasks, ({ result }) => result.mean).filter(
    ({ name }) => !name.includes('failed'),
  );

  console.table(
    tasks.map(({ name, result }) => ({
      Package: name.replace(' (passed)', ''),
      'Ops/sec': +(result?.hz).toFixed(6),
    })),
  );
}

for (const type in typesBenches) {
  await run(type, typesBenches[type]);
}
