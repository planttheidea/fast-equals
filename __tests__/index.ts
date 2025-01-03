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
    function getFakeWeakMap() {
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
      const symbol = Symbol('key');

      const a = { [symbol]: { value: 'bar' } };
      const b = { [symbol]: { value: 'bar' } };
      const c = { [symbol]: { value: 'baz' } };

      expect(strictDeepEqual(a, b)).toBe(true);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(false);
    });

    it('should handle hidden properties', () => {
      const a = {};
      const b = {};
      const c = {};

      Object.defineProperty(a, 'key', {
        configurable: false,
        enumerable: false,
        value: { value: 'bar' },
        writable: false,
      });
      Object.defineProperty(b, 'key', {
        configurable: false,
        enumerable: false,
        value: { value: 'bar' },
        writable: false,
      });
      Object.defineProperty(c, 'key', {
        configurable: false,
        enumerable: false,
        value: { value: 'baz' },
        writable: false,
      });

      expect(strictDeepEqual(a, b)).toBe(true);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(false);
    });

    it('should not be equal if property values are same but descriptors differ', () => {
      const a = { value: 'bar' };
      const b = {};
      const c = {};

      Object.defineProperty(b, 'key', {
        configurable: false,
        enumerable: false,
        value: { value: 'bar' },
        writable: false,
      });
      Object.defineProperty(c, 'key', {
        value: { value: 'bar' },
      });

      expect(strictDeepEqual(a, b)).toBe(false);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(true);
    });

    type WithCustomProperty<Type> = Type & {
      key: { value: string };
    };

    it('should handle keys on arrays', () => {
      type CustomArray = WithCustomProperty<string[]>;

      const a = ['foo', 'bar'] as CustomArray;
      const b = ['foo', 'bar'] as CustomArray;
      const c = ['foo', 'bar'] as CustomArray;

      a.key = { value: 'baz' };
      b.key = { value: 'baz' };
      c.key = { value: 'quz' };

      expect(strictDeepEqual(a, b)).toBe(true);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(false);
    });

    it('should handle keys on maps', () => {
      type CustomMap = WithCustomProperty<Map<string, string>>;

      const a = new Map([['foo', 'bar']]) as CustomMap;
      const b = new Map([['foo', 'bar']]) as CustomMap;
      const c = new Map([['foo', 'bar']]) as CustomMap;

      a.key = { value: 'baz' };
      b.key = { value: 'baz' };
      c.key = { value: 'quz' };

      expect(strictDeepEqual(a, b)).toBe(true);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(false);
    });

    it('should handle keys on sets', () => {
      type CustomSet = WithCustomProperty<Set<string>>;

      const a = new Set(['foo', 'bar']) as CustomSet;
      const b = new Set(['foo', 'bar']) as CustomSet;
      const c = new Set(['foo', 'bar']) as CustomSet;

      a.key = { value: 'baz' };
      b.key = { value: 'baz' };
      c.key = { value: 'quz' };

      expect(strictDeepEqual(a, b)).toBe(true);
      expect(strictDeepEqual(a, c)).toBe(false);
      expect(strictDeepEqual(b, c)).toBe(false);
    });

    it('issue 93 - should handle symbol keys', () => {
      const obj1 = {
        [Symbol.for('hi')]: 1,
      };
      const obj2 = {
        [Symbol.for('hi')]: 2,
      };

      expect(strictDeepEqual(obj1, obj2)).toBe(false);
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

    it('issue 123 - custom function equality comparator', () => {
      const customEqual = createCustomEqual({
        createCustomConfig: () => ({
          areFunctionsEqual(a, b) {
            return a.name === b.name;
          },
        }),
      });

      const a = function foo() {
        return 'a';
      };
      const b = function foo() {
        return 'b';
      };
      const c = function bar() {
        return 'c';
      };

      expect(customEqual(a, b)).toBe(true);
      expect(customEqual(a, c)).toBe(false);
    });
  });
});
