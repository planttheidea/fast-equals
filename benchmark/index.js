/* eslint-disable @typescript-eslint/no-var-requires */

import { deepStrictEqual as assertDeepStrictEqual } from 'node:assert';
import Table from 'cli-table3';
import deepEql from 'deep-eql';
import deepEqual from 'deep-equal';
import { dequal } from 'dequal';
import { dequal as dequalLite } from 'dequal/lite';
import fastDeepEqual from 'fast-deep-equal/es6/react.js';
import isEqualLodash from 'lodash/isEqual.js';
import orderBy from 'lodash/orderBy.js';
import nanoEqual from 'nano-equal';
import reactFastCompare from 'react-fast-compare';
import shallowEqualFuzzy from 'shallow-equal-fuzzy';
import { Bench } from 'tinybench';
import { isEqual as isEqualUnderscore } from 'underscore';
import { testSuites as tests } from '../__tests__/__helpers__/testSuites.js';
import {
  circularDeepEqual as fastEqualsCircularDeepEqual,
  deepEqual as fastEqualsDeepEqual,
  strictCircularDeepEqual as fastEqualsStrictCircularDeepEqual,
  strictDeepEqual as fastEqualsStrictDeepEqual,
} from '../dist/es/index.mjs';

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
  'fast-equals': fastEqualsDeepEqual,
  'fast-equals (circular)': fastEqualsCircularDeepEqual,
  'fast-equals (strict)': fastEqualsStrictDeepEqual,
  'fast-equals (strict circular)': fastEqualsStrictCircularDeepEqual,
  'lodash.isEqual': isEqualLodash,
  'nano-equal': nanoEqual,
  'react-fast-compare': reactFastCompare,
  'shallow-equal-fuzzy': shallowEqualFuzzy,
  'underscore.isEqual': isEqualUnderscore,
};

function getResults(tasks) {
  const table = new Table({
    head: ['Name', 'Ops / sec'],
  });

  tasks.forEach(({ name, result }) => {
    table.push([name, +(result.throughput?.mean ?? 0).toFixed(6)]);
  });

  return table.toString();
}

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
          console.error('result did not match', `(${name})`, testSuite.description, test.description);

          passed = false;
        }
      } catch (e) {
        console.error(`ERROR - ${e.message.split('\n')[0]}`, `(${name})`, testSuite.description, test.description);

        passed = false;
      }
    }

    passingTests[getPassedKey(name, testSuite)] = passed;
  }

  for (const testSuite of tests) {
    const { description } = testSuite;

    if (!typesBenches[description]) {
      typesBenches[description] = new Bench({ iterations, time: 500 });
    }

    const typesBench = typesBenches[description];

    typesBench.add(`${name} (${passingTests[getPassedKey(name, testSuite)] ? 'passed' : 'failed'})`, () => {
      for (const test of testSuite.tests) {
        if (
          test.description !== 'pseudo array and equivalent array are not equal'
          && test.description !== 'empty objects with `null` as prototype are equal'
        ) {
          fn(test.value1, test.value2);
        }
      }
    });
  }
}

async function run(name, bench) {
  console.log('');
  console.log(`Testing ${name}...`);

  await bench.run();

  const tasks = orderBy(
    bench.tasks.filter(({ result }) => result),
    ({ result }) => result.throughput?.mean ?? 0,
    ['desc'],
  );
  const table = getResults(tasks);

  console.table(table);
}

for (const type in typesBenches) {
  await run(type, typesBenches[type]);
}
