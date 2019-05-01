/* globals afterEach,beforeEach,describe,expect,it,jest */

// @ts-ignore
import testSuites from './__helpers__/testSuites';

import {
  circularDeepEqual,
  circularShallowEqual,
  createCustomEqual,
  deepEqual,
  sameValueZeroEqual,
  shallowEqual,
} from '../src/index';

describe('exports', () => {
  [
    circularDeepEqual,
    circularShallowEqual,
    createCustomEqual,
    deepEqual,
    sameValueZeroEqual,
    shallowEqual,
  ].forEach((fn) => {
    it(`should have an export for ${fn.name}`, () => {
      expect(typeof fn).toBe('function');
    });
  });
});

type Test = {
  deepEqual: boolean;
  description: string;
  shallowEqual: boolean;
  value1: any;
  value2: any;
};

type TestSuite = {
  description: string;
  tests: Test[];
};

describe('test suites', () => {
  testSuites.forEach(
    (
      { description: suiteDescription, tests }: TestSuite,
      testSuiteIndex: number,
    ) => {
      describe(`Suite ${testSuiteIndex}: ${suiteDescription}`, () => {
        tests.forEach(
          (
            {
              deepEqual: de,
              description: testDescription,
              shallowEqual: se,
              value1,
              value2,
            }: Test,
            testIndex: number,
          ) => {
            it(`should return ${de} for deepEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(deepEqual(value1, value2)).toBe(de);
            });

            it(`should return ${de} for circularDeepEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(circularDeepEqual(value1, value2)).toBe(de);
            });

            it(`should return ${se} for shallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(shallowEqual(value1, value2)).toBe(se);
            });

            it(`should return ${se} for circularShallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(circularShallowEqual(value1, value2)).toBe(se);
            });
          },
        );
      });
    },
  );
});

describe('circularDeepEqual', () => {
  it('should handles deeply-nested circular objects', () => {
    class Circular {
      me: {
        deeply: {
          nested: {
            reference: Circular;
          };
        };
        value: string;
      };

      constructor(value: string) {
        this.me = {
          deeply: {
            nested: {
              reference: this,
            },
          },
          value,
        };
      }
    }

    expect(circularDeepEqual(new Circular('foo'), new Circular('foo'))).toBe(
      true,
    );
    expect(circularDeepEqual(new Circular('foo'), new Circular('bar'))).toBe(
      false,
    );
  });
});

describe('circularShallowEqual', () => {
  it('should handle shallowly-nested circular objects', () => {
    const a: any[] = ['foo'];

    a.push(a);

    expect(circularShallowEqual(a, ['foo', a])).toBe(true);
    expect(circularShallowEqual(a, [a])).toBe(false);
  });
});
