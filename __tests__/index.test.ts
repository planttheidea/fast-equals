import { describe, expect, it } from 'vitest';
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
} from '../src/index.js';
import { testSuites } from './__helpers__/testSuites.js';

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

interface Test {
  deepEqual: boolean;
  description: string;
  shallowEqual: boolean;
  value1: any;
  value2: any;
}

interface TestSuite {
  description: string;
  tests: Test[];
}

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
  testSuites.forEach(({ description: suiteDescription, tests }: TestSuite, testSuiteIndex: number) => {
    describe(`Suite ${testSuiteIndex}: ${suiteDescription}`, () => {
      tests.forEach(
        (
          { deepEqual: de, description: testDescription, shallowEqual: se, value1, value2 }: Test,
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
  });
});

describe('values', () => {
  it('issue 118 - handle Error objects', () => {
    const errorA = new Error('boom');
    const errorB = new Error('boom');
    const errorC = new Error('shakalaka');

    // Override the stack to be equal to test deep equality.
    errorB.stack = errorA.stack;

    expect(deepEqual(errorA, errorB)).toBe(true);
    expect(deepEqual(errorA, errorC)).toBe(false);
  });

  it('issue 121 - handle URL objects', () => {
    const urlA = new URL('https://www.foo.com');
    const urlB = new URL('https://www.foo.com');
    const urlC = new URL('https://www.foo.com:4000/bar?quz&blah=boo#baz');
    const urlD = new URL('https://www.foo.com:4000/bar?quz&blah=boo#baz');

    expect(deepEqual(urlA, urlB)).toBe(true);
    expect(deepEqual(urlA, urlC)).toBe(false);
    expect(deepEqual(urlC, urlD)).toBe(true);
  });
});

describe('circular', () => {
  describe('circularDeepEqual', () => {
    it('should handles deeply-nested circular objects', () => {
      expect(circularDeepEqual(new DeepCircular('foo'), new DeepCircular('foo'))).toBe(true);
      expect(circularDeepEqual(new DeepCircular('foo'), new DeepCircular('bar'))).toBe(false);
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
      const entries: Array<[object, object]> = [];

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
        a.source === b.source
        && a.global === b.global
        && a.ignoreCase === b.ignoreCase
        && a.multiline === b.multiline
        && a.unicode === b.unicode
        && a.sticky === b.sticky
        && a.lastIndex === b.lastIndex
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
      expect(customDeepEqualCircular(new DeepCircular('foo'), new DeepCircular('foo'))).toBe(true);
      expect(customDeepEqualCircular(new DeepCircular('foo'), new DeepCircular('bar'))).toBe(false);
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
                aInstance && bInstance && state.equals(a.a, b.a, undefined, undefined, undefined, undefined, state)
              );
            }

            return false;
          },
        }),
      });

      expect(customEqual(a, b)).toBe(false);
    });

    it('issue 112 - handle custom float comparison', () => {
      const customEqual = createCustomEqual({
        createCustomConfig: () => ({
          areNumbersEqual(a, b) {
            if (a === b) {
              return true;
            }

            const diff = Math.abs(a - b);

            if (diff < Number.EPSILON) {
              return true;
            }

            return diff <= Number.EPSILON * Math.min(Math.abs(a), Math.abs(b));
          },
        }),
      });

      const a = 0.1 + 0.2;
      const b = 0.3;

      expect(deepEqual(a, b)).toBe(false);
      expect(customEqual(a, b)).toBe(true);
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

describe('correctness fixes', () => {
  describe('URL', () => {
    it('compares the query string', () => {
      expect(deepEqual(new URL('https://foo.com/?a=1'), new URL('https://foo.com/?a=2'))).toBe(false);
      expect(deepEqual(new URL('https://foo.com/?a=1'), new URL('https://foo.com/?a=1'))).toBe(true);
      expect(deepEqual(new URL('https://foo.com/'), new URL('https://foo.com/?a=1'))).toBe(false);
    });

    it('compares every other component', () => {
      const base = new URL('https://user:pass@foo.com:4000/bar?a=1#baz');

      expect(deepEqual(base, new URL('https://user:pass@foo.com:4000/bar?a=1#baz'))).toBe(true);
      expect(deepEqual(base, new URL('https://user:nope@foo.com:4000/bar?a=1#baz'))).toBe(false);
      expect(deepEqual(base, new URL('https://user:pass@foo.com:4001/bar?a=1#baz'))).toBe(false);
      expect(deepEqual(base, new URL('https://user:pass@foo.com:4000/oof?a=1#baz'))).toBe(false);
      expect(deepEqual(base, new URL('https://user:pass@foo.com:4000/bar?a=1#zab'))).toBe(false);
    });

    it('respects parser normalization', () => {
      expect(deepEqual(new URL('https://foo.com'), new URL('https://foo.com/'))).toBe(true);
    });

    it('keeps percent-encoded separators distinct from real ones', () => {
      // Comparison relies on the serializer encoding `&` and `=` wherever they appear inside a
      // name or a value, so that the query can be split back into exactly its pairs.
      expect(deepEqual(new URL('https://foo.com/?a=x%26y'), new URL('https://foo.com/?a=x%26y'))).toBe(true);
      expect(deepEqual(new URL('https://foo.com/?a=x%26y'), new URL('https://foo.com/?a=x&y='))).toBe(false);
      expect(deepEqual(new URL('https://foo.com/?a%3Db=1'), new URL('https://foo.com/?a%3Db=1'))).toBe(true);
      expect(deepEqual(new URL('https://foo.com/?a%3Db=1'), new URL('https://foo.com/?a=b%3D1'))).toBe(false);
    });

    it('does not treat query parameter order as significant', () => {
      expect(deepEqual(new URL('https://foo.com/?a=1&b=2'), new URL('https://foo.com/?b=2&a=1'))).toBe(true);
      expect(deepEqual(new URL('https://foo.com/?a=1&a=2'), new URL('https://foo.com/?a=2&a=1'))).toBe(true);
      // Repeated keys are counted, so this compares multisets rather than sets.
      expect(deepEqual(new URL('https://foo.com/?a=1&a=2'), new URL('https://foo.com/?a=1&a=1'))).toBe(false);
      expect(deepEqual(new URL('https://foo.com/?a=b'), new URL('https://foo.com/?b=a'))).toBe(false);
      expect(deepEqual(new URL('https://foo.com/?a=1&b=2'), new URL('https://foo.com/?b=2&a=3'))).toBe(false);

      // Reordering the query must not mask a difference elsewhere in the URL.
      expect(deepEqual(new URL('https://foo.com/x?a=1&b=2'), new URL('https://foo.com/y?b=2&a=1'))).toBe(false);
      expect(deepEqual(new URL('https://foo.com/?a=1&b=2#x'), new URL('https://foo.com/?b=2&a=1#y'))).toBe(false);
      expect(deepEqual(new URL('https://foo.com:1/?a=1&b=2'), new URL('https://foo.com:2/?b=2&a=1'))).toBe(false);
    });
  });

  describe('Error', () => {
    function createError<Value>(message: string, property?: Value) {
      const error = new Error(message) as Error & { property?: Value };

      // Stacks are location-dependent, so they are normalized to isolate what is being tested.
      error.stack = 'STACK';

      if (arguments.length > 1) {
        error.property = property;
      }

      return error;
    }

    it('compares own enumerable properties', () => {
      expect(deepEqual(createError('boom', 404), createError('boom', 404))).toBe(true);
      expect(deepEqual(createError('boom', 404), createError('boom', 500))).toBe(false);
      expect(deepEqual(createError('boom', 404), createError('boom'))).toBe(false);
    });

    it('compares own enumerable properties deeply', () => {
      expect(deepEqual(createError('boom', { code: 'E' }), createError('boom', { code: 'E' }))).toBe(true);
      expect(deepEqual(createError('boom', { code: 'E' }), createError('boom', { code: 'F' }))).toBe(false);
    });

    it('compares properties of subclasses', () => {
      class HttpError extends Error {
        status: number;

        constructor(message: string, status: number) {
          super(message);

          this.stack = 'STACK';
          this.status = status;
        }
      }

      expect(deepEqual(new HttpError('boom', 404), new HttpError('boom', 404))).toBe(true);
      expect(deepEqual(new HttpError('boom', 404), new HttpError('boom', 500))).toBe(false);
    });

    it('compares `cause` by value rather than by reference', () => {
      const a = new Error('boom', { cause: { code: 'E' } });
      const b = new Error('boom', { cause: { code: 'E' } });
      const c = new Error('boom', { cause: { code: 'F' } });

      a.stack = b.stack = c.stack = 'STACK';

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });

    it('handles self-referential errors when circular', () => {
      function createSelfReferential() {
        const error = new Error('boom') as Error & { self?: unknown };

        error.stack = 'STACK';
        error.cause = error;
        error.self = error;

        return error;
      }

      expect(circularDeepEqual(createSelfReferential(), createSelfReferential())).toBe(true);
      expect(strictCircularDeepEqual(createSelfReferential(), createSelfReferential())).toBe(true);
    });

    it('compares own enumerable properties in strict mode', () => {
      expect(strictDeepEqual(createError('boom', 404), createError('boom', 404))).toBe(true);
      expect(strictDeepEqual(createError('boom', 404), createError('boom', 500))).toBe(false);
    });

    it('compares symbol, non-enumerable and descriptor differences in strict mode only', () => {
      const symbol = Symbol('tag');
      const withSymbol = (value: string) => Object.assign(createError('boom'), { [symbol]: value });
      const withHidden = (value: string) =>
        Object.defineProperty(createError('boom'), 'hidden', { configurable: true, enumerable: false, value });

      expect(deepEqual(withSymbol('a'), withSymbol('b'))).toBe(true);
      expect(strictDeepEqual(withSymbol('a'), withSymbol('b'))).toBe(false);

      expect(deepEqual(withHidden('a'), withHidden('b'))).toBe(true);
      expect(strictDeepEqual(withHidden('a'), withHidden('b'))).toBe(false);

      const withDescriptor = (enumerable: boolean) =>
        Object.defineProperty(createError('boom'), 'code', { configurable: true, enumerable, value: 'X' });

      expect(strictDeepEqual(withDescriptor(true), withDescriptor(false))).toBe(false);
    });
  });

  describe('TypedArray', () => {
    it('treats `NaN` as equal to itself, matching all other numeric comparisons', () => {
      expect(deepEqual(new Float64Array([NaN, 1]), new Float64Array([NaN, 1]))).toBe(true);
      expect(deepEqual(new Float32Array([NaN]), new Float32Array([NaN]))).toBe(true);
      expect(deepEqual({ value: NaN }, { value: NaN })).toBe(true);
    });

    it('still reports `NaN` as unequal to a number', () => {
      expect(deepEqual(new Float64Array([NaN]), new Float64Array([1]))).toBe(false);
      expect(deepEqual(new Float64Array([1]), new Float64Array([NaN]))).toBe(false);
    });

    it('treats `-0` and `0` as equal, matching SameValueZero', () => {
      expect(deepEqual(new Float64Array([-0]), new Float64Array([0]))).toBe(true);
    });
  });
});
