/* globals afterEach,beforeEach,describe,expect,it,test,jest */

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

describe('issue 58 - key and value being identical', () => {
  it('should handle duplicate but equal `Map` entries', () => {
    const mapA = new Map<any, any>([
      [{ b: 'c' }, 2],
      [{ b: 'c' }, 2],
    ]);
    const mapB = new Map<any, any>([
      [{ b: 'c' }, 2],
      [{ b: 'c' }, 2],
    ]);

    const result = deepEqual(mapA, mapB);

    expect(result).toBe(true);
  });

  it('should handle the first `Map` entry being unequal', () => {
    const mapA = new Map<any, any>([
      [{ b: 'c' }, 2],
      [{ b: 'c' }, 2],
    ]);
    const mapB = new Map<any, any>([
      ['foo', 'different'],
      [{ b: 'c' }, 2],
    ]);

    const result = deepEqual(mapA, mapB);

    expect(result).toBe(false);
  });

  it('should handle the last `Map` entry being unequal', () => {
    const mapA = new Map<any, any>([
      [{ b: 'c' }, 2],
      [{ b: 'c' }, 2],
    ]);
    const mapB = new Map<any, any>([
      [{ b: 'c' }, 2],
      ['foo', 'different'],
    ]);

    const result = deepEqual(mapA, mapB);

    expect(result).toBe(false);
  });

  it('should handle an intermediary `Map` entry being unequal', () => {
    const mapA = new Map<any, any>([
      ['foo', 'different'],
      [{ b: 'c' }, 2],
      [{ b: 'c' }, 2],
    ]);
    const mapB = new Map<any, any>([
      ['foo', 'different'],
      ['foo', 'different'],
      [{ b: 'c' }, 2],
    ]);

    const result = deepEqual(mapA, mapB);

    expect(result).toBe(false);
  });

  it('should handle duplicate but equal `Set` entries', () => {
    const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
    const setB = new Set<any>([{ b: 'c' }, { b: 'c' }]);

    const result = deepEqual(setA, setB);

    expect(result).toBe(true);
  });

  it('should handle the first `Set` entry being unequal', () => {
    const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
    const setB = new Set<any>(['foo', { b: 'c' }]);

    const result = deepEqual(setA, setB);

    expect(result).toBe(false);
  });

  it('should handle the last `Set` entry being unequal', () => {
    const setA = new Set<any>([{ b: 'c' }, { b: 'c' }]);
    const setB = new Set<any>([{ b: 'c' }, 'foo']);

    const result = deepEqual(setA, setB);

    expect(result).toBe(false);
  });

  it('should handle an intermediary `Set` entry being unequal', () => {
    const setA = new Set<any>(['foo', { b: 'c' }, { b: 'c' }]);
    const setB = new Set<any>(['foo', 'foo', { b: 'c' }]);

    const result = deepEqual(setA, setB);

    expect(result).toBe(false);
  });
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
