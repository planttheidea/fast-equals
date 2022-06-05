/* eslint-disable @typescript-eslint/no-var-requires */

const assertDeepStrictEqual = require('assert').deepStrictEqual;

const { createSuite } = require('benchee');
const Table = require('cli-table3');

const tests = require('../__tests__/__helpers__/testSuites');

const fe = require('../dist/fast-equals.cjs');

const equalPackages = {
  'assert.deepStrictEqual': (a, b) => {
    try {
      return assertDeepStrictEqual(a, b);
    } catch (e) {
      return false;
    }
  },
  'deep-eql': require('deep-eql'),
  'deep-equal': require('deep-equal'),
  'fast-deep-equal': require('fast-deep-equal'),
  'fast-equals': fe.deepEqual,
  'fast-equals (circular)': fe.circularDeepEqual,
  'lodash.isEqual': require('lodash').isEqual,
  'nano-equal': require('nano-equal'),
  'react-fast-compare': require('react-fast-compare'),
  'shallow-equal-fuzzy': require('shallow-equal-fuzzy'),
  'underscore.isEqual': require('underscore').isEqual,
};

const filteredEquivalentTests = ['maps', 'sets', 'promises'];

/*
 * filter out Map and Set, as those do not pass with anything but lodash and falsely inflate the average ops/sec
 */
const equivalentTests = tests.filter(({ description }) =>
  filteredEquivalentTests.every((test) => !~description.indexOf(test)),
);

const passingTests = {};

console.log('');

const getPassedKey = (equalName, { description }) =>
  `${equalName} - ${description}`;

const getResults = (results) => {
  const table = new Table({
    head: ['Name', 'Ops / sec'],
  });

  results.forEach(({ name, stats }) => {
    if (!~name.indexOf('passing: false')) {
      table.push([
        name.replace(' (passing: true)', ''),
        stats.ops.toLocaleString(),
      ]);
    }
  });

  return table.toString();
};

const suite = createSuite({
  minTime: 1000,
  onComplete(results) {
    const combinedResults = Object.keys(results)
      .reduce((combined, group) => {
        const groupResults = results[group];

        return groupResults.map(({ name, stats }) => {
          const existingRowIndex = combined.findIndex(
            ({ name: rowName }) => name === rowName,
          );

          return ~existingRowIndex
            ? {
                ...combined[existingRowIndex],
                stats: {
                  elapsed: (combined[existingRowIndex].stats.elapsed +=
                    stats.elapsed),
                  iterations: (combined[existingRowIndex].stats.iterations +=
                    stats.iterations),
                },
              }
            : {
                name,
                stats: {
                  elapsed: stats.elapsed,
                  iterations: stats.iterations,
                },
              };
        });
      }, [])
      .map(({ name, stats }) => ({
        name,
        stats: {
          ...stats,
          ops: stats.iterations / stats.elapsed,
        },
      }))
      .sort((a, b) => {
        if (a.stats.ops > b.stats.ops) {
          return -1;
        }

        if (a.stats.ops < b.stats.ops) {
          return 1;
        }

        return 0;
      });

    console.log('');
    console.log('Benchmark results complete, overall averages:');
    console.log('');
    console.log(getResults(combinedResults));
    console.log('');
  },
  onGroupComplete({ group, results }) {
    console.log('');
    console.log(`...finished group ${group}.`);
    console.log('');
    console.log(getResults(results));
    console.log('');
  },
  onGroupStart(group) {
    console.log('');
    console.log(`Starting benchmarks for group ${group}...`);
    console.log('');
  },
  onResult({ name, stats }) {
    console.log(
      `Benchmark completed for ${name}: ${stats.ops.toLocaleString()} ops/sec`,
    );
  },
});

for (const equalName in equalPackages) {
  const equalFunc = equalPackages[equalName];

  for (const testSuite of tests) {
    let passed = true;

    for (const test of testSuite.tests) {
      try {
        if (equalFunc(test.value1, test.value2) !== test.deepEqual) {
          console.error(
            'different result',
            equalName,
            testSuite.description,
            test.description,
          );

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

  suite.add(equalName, 'mixed types', () => {
    for (const testSuite of equivalentTests) {
      for (const test of testSuite.tests) {
        if (
          test.description !== 'pseudo array and equivalent array are not equal'
        ) {
          equalFunc(test.value1, test.value2);
        }
      }
    }
  });
}

for (const testSuite of tests) {
  for (const equalName in equalPackages) {
    let equalFunc = equalPackages[equalName];

    if (equalFunc === true) {
      equalFunc = require(equalName);
    }

    suite.add(
      `${equalName} (passing: ${
        passingTests[getPassedKey(equalName, testSuite)]
      })`,
      testSuite.description,
      () => {
        for (const test of testSuite.tests) {
          if (
            test.description !==
            'pseudo array and equivalent array are not equal'
          ) {
            equalFunc(test.value1, test.value2);
          }
        }
      },
    );
  }
}

suite.run();
