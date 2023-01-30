import testSuites from './__helpers__/testSuites';
import {
  circularDeepEqual,
  circularShallowEqual,
  createCustomCircularEqual,
  createCustomEqual,
  deepEqual,
  sameValueZeroEqual,
  shallowEqual,
} from '../src';
import { BaseCircular } from '../src/internalTypes';

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

class DeepCircular {
  me: {
    deeply: {
      nested: {
        reference: DeepCircular;
      };
    };
    regexp: RegExp;
    value: string;
  };

  constructor(value: string) {
    this.me = {
      deeply: {
        nested: {
          reference: this,
        },
      },
      regexp: new RegExp(value, 'g'),
      value,
    };
  }
}

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
    expect(
      circularDeepEqual(new DeepCircular('foo'), new DeepCircular('foo')),
    ).toBe(true);
    expect(
      circularDeepEqual(new DeepCircular('foo'), new DeepCircular('bar')),
    ).toBe(false);
  });

  it('should handle shared references between objects', () => {
    const x = [1];
    const left = [{ a: [1], b: x }];
    const right = [{ a: x, b: [1] }];

    // should returns true, but returns false
    expect(circularDeepEqual(left, right)).toBe(true);
  });

  it('should handle shared circular arrays constructed differently', () => {
    type RecursiveArray = Array<number | RecursiveArray>;
    const x: RecursiveArray = [1];
    x.push(x);
    const left = [[1, x], x];
    const right = [x, [1, x]];

    expect(circularDeepEqual(left, right)).toBe(true);
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

describe('createCustomCircularEqual', () => {
  function getFakeWeakMap(): BaseCircular {
    const entries: [object, object][] = [];

    return {
      delete(key: object) {
        for (let index = 0; index < entries.length; ++index) {
          if (entries[index]![0] === key) {
            entries.splice(index, 1);
            return true;
          }
        }

        return false;
      },

      get(key: object) {
        for (let index = 0; index < entries.length; ++index) {
          if (entries[index]![0] === key) {
            return entries[index]![1];
          }
        }

        return undefined;
      },

      set(key: object, value: object) {
        for (let index = 0; index < entries.length; ++index) {
          if (entries[index]![0] === key) {
            entries[index]![1] = value;
            return this;
          }
        }

        entries.push([key, value]);

        return this;
      },
    };
  }

  function areRegExpsEqualNoFlagsSupport(a: RegExp, b: RegExp) {
    return (
      a.source === b.source &&
      a.global === b.global &&
      a.ignoreCase === b.ignoreCase &&
      a.multiline === b.multiline &&
      a.unicode === b.unicode &&
      a.sticky === b.sticky &&
      a.lastIndex === b.lastIndex
    );
  }

  const customDeepEqualCircular = createCustomCircularEqual(
    () => ({
      areRegExpsEqual: areRegExpsEqualNoFlagsSupport,
    }),
    () => ({
      cache: getFakeWeakMap(),
    }),
  );

  it('should handle the custom equality check', () => {
    expect(
      customDeepEqualCircular(new DeepCircular('foo'), new DeepCircular('foo')),
    ).toBe(true);
    expect(
      customDeepEqualCircular(new DeepCircular('foo'), new DeepCircular('bar')),
    ).toBe(false);
  });
});
