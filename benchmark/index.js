/* eslint-disable @typescript-eslint/no-var-requires */

import { deepStrictEqual as assertDeepStrictEqual } from 'assert';
import tests from '../__tests__/__helpers__/testSuites.js';

import deepEql from 'deep-eql';
import deepEqual from 'deep-equal';
import { dequal } from 'dequal';
import { dequal as dequalLite } from 'dequal/lite';
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
      return assertDeepStrictEqual(a, b) === undefined;
    } catch (e) {
      const message = e.message.split('\n')[0];

      if (message.includes('Expected values to be strictly deep-equal')) {
        return false;
      }

      throw e;
    }
  },
  'deep-eql': deepEql,
  'deep-equal': deepEqual,
  dequal: dequal,
  'dequal/lite': dequalLite,
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
            'result did not match',
            `(${name})`,
            testSuite.description,
            test.description,
          );

          passed = false;
        }
      } catch (e) {
        console.error(
          `ERROR - ${e.message.split('\n')[0]}`,
          `(${name})`,
          testSuite.description,
          test.description,
        );

        passed = false;
      }
    }

    passingTests[getPassedKey(name, testSuite)] = passed;
  }

  for (const testSuite of tests) {
    const { description } = testSuite;

    if (!typesBenches[description]) {
      typesBenches[description] = new Bench({ iterations });
    }

    const typesBench = typesBenches[description];

    typesBench.add(
      `${name} (${
        passingTests[getPassedKey(name, testSuite)] ? 'passed' : 'failed'
      })`,
      () => {
        for (const test of testSuite.tests) {
          if (
            test.description !==
              'pseudo array and equivalent array are not equal' &&
            test.description !==
              'empty objects with `null` as prototype are equal'
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
