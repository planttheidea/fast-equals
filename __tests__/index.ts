import testSuites from './__helpers__/testSuites';
import {
  circularDeepEqual,
  circularShallowEqual,
  createCustomEqual,
  deepEqual,
  sameValueZeroEqual,
  shallowEqual,
  strictCircularDeepEqual,
  strictCircularShallowEqual,
  strictDeepEqual,
  strictShallowEqual,
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
    strictCircularDeepEqual,
    strictCircularShallowEqual,
    strictDeepEqual,
    strictShallowEqual,
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

            it(`should return ${de} for strictDeepEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(strictDeepEqual(value1, value2)).toBe(de);
            });

            it(`should return ${de} for circularDeepEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(circularDeepEqual(value1, value2)).toBe(de);
            });

            it(`should return ${de} for strictCircularDeepEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(strictCircularDeepEqual(value1, value2)).toBe(de);
            });

            it(`should return ${se} for shallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(shallowEqual(value1, value2)).toBe(se);
            });

            it(`should return ${se} for strictShallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(strictShallowEqual(value1, value2)).toBe(se);
            });

            it(`should return ${se} for circularShallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(circularShallowEqual(value1, value2)).toBe(se);
            });

            it(`should return ${se} for strictCircularShallowEqual comparison of ${testDescription} (test ${testIndex})`, () => {
              expect(strictCircularShallowEqual(value1, value2)).toBe(se);
            });
          },
        );
      });
    },
  );
});

describe('circular', () => {
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

    const customDeepEqualCircular = createCustomEqual({
      circular: true,
      createCustomConfig: () => ({
        areRegExpsEqual: areRegExpsEqualNoFlagsSupport,
      }),
      createState: () => ({
        cache: getFakeWeakMap(),
      }),
    });

    it('should handle the custom equality check', () => {
      expect(
        customDeepEqualCircular(
          new DeepCircular('foo'),
          new DeepCircular('foo'),
        ),
      ).toBe(true);
      expect(
        customDeepEqualCircular(
          new DeepCircular('foo'),
          new DeepCircular('bar'),
        ),
      ).toBe(false);
    });
  });
});

describe('strict', () => {
  describe('strictDeepEqual', () => {
    it('issue 93 - should handle symbol properties', () => {
      const symbol = Symbol('foo');

      const object1 = { [symbol]: 'bar' };
      const object2 = { [symbol]: 'bar' };
      const object3 = { [symbol]: 'baz' };

      expect(strictDeepEqual(object1, object2)).toBe(true);
      expect(strictDeepEqual(object1, object3)).toBe(false);
      expect(strictDeepEqual(object2, object3)).toBe(false);
    });

    it('should handle keys on arrays', () => {
      type CustomArray = string[] & { key: string };

      const array1 = ['foo', 'bar'] as CustomArray;
      const array2 = ['foo', 'bar'] as CustomArray;
      const array3 = ['foo', 'bar'] as CustomArray;

      array1.key = 'baz';
      array2.key = 'baz';
      array3.key = 'quz';

      expect(strictDeepEqual(array1, array2)).toBe(true);
      expect(strictDeepEqual(array1, array3)).toBe(false);
      expect(strictDeepEqual(array2, array3)).toBe(false);
    });
  });

  describe('createCustomEqual', () => {
    it('issue 91 - should handle getters on classes', () => {
      const fakePrivateProperty: string[] = [];
      let index = 0;

      class ClassWithPrivateJsField {
        index = index++;

        constructor(a: string) {
          fakePrivateProperty[this.index] = a;
        }

        get a() {
          return fakePrivateProperty[this.index];
        }
      }

      const a = new ClassWithPrivateJsField('v1');
      const b = new ClassWithPrivateJsField('v2');

      const customEqual = createCustomEqual({
        circular: true,
        createCustomConfig: ({ areObjectsEqual }) => ({
          areObjectsEqual: (a, b, state) => {
            if (!areObjectsEqual(a, b, state)) {
              return false;
            }

            const aInstance = a instanceof ClassWithPrivateJsField;
            const bInstance = b instanceof ClassWithPrivateJsField;

            if (aInstance || bInstance) {
              return (
                aInstance &&
                bInstance &&
                state.equals(
                  a.a,
                  b.a,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  state,
                )
              );
            }

            return false;
          },
        }),
      });

      expect(customEqual(a, b)).toBe(false);
    });
  });
});
