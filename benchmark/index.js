'use strict';

const assertDeepStrictEqual = require('assert').deepStrictEqual;
const Benchmark = require('benchmark');

const tests = require('../test/helpers/testSuites');

const equalPackages = {
  'fast-equals': require('../lib/index').deepEqual,
  'fast-deep-equal': true,
  'nano-equal': true,
  'shallow-equal-fuzzy': true,
  'underscore.isEqual': require('underscore').isEqual,
  'lodash.isEqual': require('lodash').isEqual,
  'deep-equal': true,
  'deep-eql': true,
  'assert.deepStrictEqual': (a, b) => {
    try {
      assertDeepStrictEqual(a, b);

      return true;
    } catch (e) {
      return false;
    }
  },
  'react-fast-compare': require('react-fast-compare')
};

const filteredEquivalentTests = ['maps', 'sets', 'promises'];

/*
 * filter out Map and Set, as those do not pass with anything but lodash and falsely inflate the average ops/sec
 */
const equivalentTests = tests.filter(({description}) =>
  filteredEquivalentTests.every((test) => !~description.indexOf(test))
);

let passingTests = {};

console.log('');

const suite = new Benchmark.Suite();

const getPassedKey = (equalName, {description}) => `${equalName} - ${description}`;

for (const equalName in equalPackages) {
  let equalFunc = equalPackages[equalName];

  if (equalFunc === true) {
    equalFunc = require(equalName);
  }

  for (const testSuite of tests) {
    let passed = true;

    for (const test of testSuite.tests) {
      try {
        if (equalFunc(test.value1, test.value2) !== test.deepEqual) {
          console.error('different result', equalName, testSuite.description, test.description);

          passed = false;
        }
      } catch (e) {
        console.error(equalName, testSuite.description, test.description, e);

        passed = false;
      }
    }

    passingTests[getPassedKey(equalName, testSuite)] = passed;
  }

  console.log('');

  suite.add(equalName, () => {
    for (const testSuite of equivalentTests) {
      for (const test of testSuite.tests) {
        if (test.description !== 'pseudo array and equivalent array are not equal') {
          equalFunc(test.value1, test.value2);
        }
      }
    }
  });
}

const typeSuite = new Benchmark.Suite();

for (const equalName in equalPackages) {
  let equalFunc = equalPackages[equalName];

  if (equalFunc === true) {
    equalFunc = require(equalName);
  }

  for (const testSuite of tests) {
    typeSuite.add(
      `${equalName} - ${testSuite.description} (passing: ${passingTests[getPassedKey(equalName, testSuite)]})`,
      () => {
        for (const test of testSuite.tests) {
          if (test.description !== 'pseudo array and equivalent array are not equal') {
            equalFunc(test.value1, test.value2);
          }
        }
      }
    );
  }
}

const runMainSuite = () => {
  console.log('Running average performance comparison...');
  console.log('');

  return new Promise((resolve) => {
    suite
      .on('cycle', (event) => {
        const result = event.target.toString();

        return console.log(result);
      })
      .on('complete', function() {
        console.log('');
        console.log(`...complete, the fastest is ${this.filter('fastest').map('name')}.`);

        resolve();
      })
      .run({async: true});
  });
};

const runTypeSuite = () => {
  console.log('');
  console.log('Running type-specific performance comparison...');
  console.log('');

  return new Promise((resolve) => {
    typeSuite
      .on('cycle', (event) => {
        const result = event.target.toString();

        const isPassing = /passing: true/.test(result);
        const cleanResult = isPassing ? result : result.replace(/x (.*) ops/, 'x 0 ops');

        return console.log(cleanResult);
      })
      .on('complete', () => {
        console.log('');
        console.log('...complete.');

        resolve();
      })
      .run({async: true});
  });
};

// runMainSuite();
// runTypeSuite();
runMainSuite().then(runTypeSuite);
