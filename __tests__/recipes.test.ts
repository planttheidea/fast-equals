import { describe, expect, test, vi } from 'vitest';
import type { EqualityComparator } from '../src/index.js';
import { createCustomEqual, sameValueEqual } from '../src/index.js';

describe('createCustomEqual', () => {
  describe('legacy-regexp-support', () => {
    const areRegExpsEqual = (a: RegExp, b: RegExp) => {
      return (
        a.source === b.source
        && a.global === b.global
        && a.ignoreCase === b.ignoreCase
        && a.multiline === b.multiline
        && a.unicode === b.unicode
        && a.sticky === b.sticky
        && a.lastIndex === b.lastIndex
      );
    };

    const deepEqual = createCustomEqual({
      createCustomConfig: () => ({ areRegExpsEqual }),
    });
    const shallowEqual = createCustomEqual({
      createCustomConfig: () => ({
        areRegExpsEqual,
        createIsNestedEqual: () => sameValueEqual,
      }),
    });

    test('verifies the regexps correctly', () => {
      const a = /foo/gi;
      const b = /foo/gi;
      const c = /bar/g;

      expect(deepEqual(a, b)).toBe(true);
      expect(shallowEqual(a, b)).toBe(true);

      expect(deepEqual(a, c)).toBe(false);
      expect(shallowEqual(a, c)).toBe(false);
    });
  });

  describe('explicit-property-check', () => {
    interface SpecialObject {
      foo: string;
      bar: {
        baz: number;
      };
    }

    const areObjectsEqual = (a: SpecialObject, b: SpecialObject) => {
      return a.foo === b.foo && a.bar.baz === b.bar.baz;
    };

    const spy = vi.fn(areObjectsEqual);

    const isSpecialObjectEqual = createCustomEqual({
      createCustomConfig: () => ({
        areObjectsEqual: spy,
      }),
    });

    test('verifies the special object', () => {
      const a: SpecialObject = { foo: 'foo', bar: { baz: 123 } };
      const b: SpecialObject = { foo: 'foo', bar: { baz: 123 } };
      const c: SpecialObject = { foo: 'bar', bar: { baz: 234 } };

      expect(isSpecialObjectEqual(a, b)).toBe(true);
      expect(isSpecialObjectEqual(a, c)).toBe(false);
    });
  });

  describe('using-meta-in-comparison', () => {
    interface Meta {
      value: string;
    }

    const deepEqual = createCustomEqual<Meta>({
      createInternalComparator: (deepEqual) => (a, b, _keyA, _keyB, _parentA, _parentB, state) => {
        return deepEqual(a, b, state) || a === state.meta.value || b === state.meta.value;
      },
      createState: () => ({ meta: { value: 'baz' } }),
    });

    test('verifies the object itself', () => {
      const a = { bar: 'bar' };
      const b = { bar: 'bar' };
      const c = { bar: 'quz' };

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });

    test('verifies the object against meta', () => {
      const a = { foo: 'bar', bar: 'baz' };
      const b = { foo: 'bar', bar: 'baz' };
      const c = { foo: 'bar', bar: 'quz' };

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(true);
      expect(deepEqual(a, {})).toBe(false);
    });
  });

  describe('non-standard-properties', () => {
    const hiddenReferences = new WeakMap();

    class HiddenProperty {
      hidden!: string;
      visible: boolean;

      constructor(value: string) {
        this.visible = true;

        hiddenReferences.set(this, value);
      }
    }

    HiddenProperty.prototype.hidden = 'foo';

    function createAreObjectsEqual<AreObjectsEqual extends EqualityComparator<any>>(
      areObjectsEqual: AreObjectsEqual,
    ): AreObjectsEqual {
      return function (a, b, state) {
        if (!areObjectsEqual(a, b, state)) {
          return false;
        }

        const aInstance = a instanceof HiddenProperty;
        const bInstance = b instanceof HiddenProperty;

        if (aInstance || bInstance) {
          return (
            aInstance
            && bInstance
            && a.hidden === 'foo'
            && b.hidden === 'foo'
            && hiddenReferences.get(a) === hiddenReferences.get(b)
          );
        }

        return true;
      } as AreObjectsEqual;
    }

    const deepEqual = createCustomEqual({
      createCustomConfig: ({ areObjectsEqual }) => ({
        areObjectsEqual: createAreObjectsEqual(areObjectsEqual),
      }),
    });

    test('verifies the object with non-standard properties', () => {
      const a = new HiddenProperty('bar');
      const b = new HiddenProperty('bar');
      const c = new HiddenProperty('baz');

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
      expect(deepEqual(a, {})).toBe(false);
    });
  });

  describe('strict-property-descriptor-check', () => {
    const areObjectsEqual = (a: Record<string | symbol, any>, b: Record<string | symbol, any>) => {
      const propertiesA = [...Object.getOwnPropertyNames(a), ...Object.getOwnPropertySymbols(a)];
      const propertiesB = [...Object.getOwnPropertyNames(b), ...Object.getOwnPropertySymbols(b)];

      if (propertiesA.length !== propertiesB.length) {
        return false;
      }

      return propertiesA.every((property) => {
        const descriptorA = Object.getOwnPropertyDescriptor(a, property);
        const descriptorB = Object.getOwnPropertyDescriptor(b, property);

        return (
          descriptorA
          && descriptorB
          && descriptorA.configurable === descriptorB.configurable
          && descriptorA.enumerable === descriptorB.enumerable
          && descriptorA.value === descriptorB.value
          && descriptorA.writable === descriptorB.writable
        );
      });
    };

    const deepEqual = createCustomEqual({
      createCustomConfig: () => ({ areObjectsEqual }),
    });

    test('verifies the object property descriptors', () => {
      const symbol = Symbol('property');

      const a = Object.defineProperties(
        {},
        {
          foo: {
            enumerable: false,
            value: 'bar',
          },
          [symbol]: {
            enumerable: true,
            value: 'symbol',
          },
        },
      );
      const b = Object.defineProperties(
        {},
        {
          foo: {
            enumerable: false,
            value: 'bar',
          },
          [symbol]: {
            enumerable: true,
            value: 'symbol',
          },
        },
      );
      const c = Object.defineProperties(
        {},
        {
          foo: {
            enumerable: true,
            value: 'bar',
          },
          [symbol]: {
            enumerable: false,
            value: 'symbol',
          },
        },
      );

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });
  });
});

describe('createCustomCircularEqual', () => {
  describe('legacy-circular-equal-support', () => {
    interface Meta {
      customMethod(): void;
      customValue: string;
    }

    function getCache() {
      const entries: Array<[object, any]> = [];

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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return entries[index]![1];
            }
          }
        },

        set(key: object, value: any) {
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

    const meta = {
      customMethod() {
        console.log('hello!');
      },
      customValue: 'goodbye',
    };

    const circularDeepEqual = createCustomEqual<Meta>({
      circular: true,
      createState: () => ({
        cache: getCache(),
        meta,
      }),
    });

    test('handles shared references between objects', () => {
      const x = [1];
      const left = [{ a: [1], b: x }];
      const right = [{ a: x, b: [1] }];

      // should returns true, but returns false
      expect(circularDeepEqual(left, right)).toBe(true);
    });

    test('handles shared circular arrays constructed differently', () => {
      type RecursiveArray = Array<number | RecursiveArray>;
      const x: RecursiveArray = [1];
      x.push(x);
      const left = [[1, x], x];
      const right = [x, [1, x]];

      expect(circularDeepEqual(left, right)).toBe(true);
    });
  });
});

describe('special-objects', () => {
  test('gets a custom comparator based on a custom `@@toStringTag`', () => {
    // Emulate something like a private property
    const hiddenData = new WeakMap<Thing, number>();

    class Thing {
      [Symbol.toStringTag] = 'Thing';
      constructor(value: number) {
        hiddenData.set(this, value);
      }
      equals(other: Thing) {
        return hiddenData.get(this) === hiddenData.get(other);
      }
    }

    const deepEqual = createCustomEqual({
      createCustomConfig: () => ({
        getUnsupportedCustomComparator(a) {
          const shortTag = a?.[Symbol.toStringTag];

          if (shortTag === 'Thing') {
            return (a, b) => a instanceof Thing && b instanceof Thing && a.equals(b);
          }
        },
      }),
    });

    const a = new Thing(1);
    const b = new Thing(1);
    const c = new Thing(2);
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  test('gets a custom comparator based on a custom class name fallback object tag', () => {
    // Emulate something like a private property
    const hiddenData = new WeakMap<Thing, number>();

    class Thing {
      [Symbol.toStringTag] = 'Thing';
      constructor(value: number) {
        hiddenData.set(this, value);
      }
      equals(other: Thing) {
        return hiddenData.get(this) === hiddenData.get(other);
      }
    }

    const deepEqual = createCustomEqual({
      createCustomConfig: () => ({
        getUnsupportedCustomComparator(_a, _b, _state, tag) {
          if (tag === '[object Thing]') {
            return (a, b) => a instanceof Thing && b instanceof Thing && a.equals(b);
          }
        },
      }),
    });

    const a = new Thing(1);
    const b = new Thing(1);
    const c = new Thing(2);
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });

  test('gets a custom comparator based on a custom logic', () => {
    // Emulate something like a private property
    const hiddenData = new WeakMap<Thing, number>();

    class Thing {
      [Symbol.toStringTag] = 'Thing';
      constructor(value: number) {
        hiddenData.set(this, value);
      }
      equals(other: Thing) {
        return hiddenData.get(this) === hiddenData.get(other);
      }
    }

    const deepEqual = createCustomEqual({
      createCustomConfig: () => ({
        getUnsupportedCustomComparator(a, b) {
          if (a instanceof Thing && b instanceof Thing) {
            return (a: Thing, b: Thing) => a.equals(b);
          }
        },
      }),
    });

    const a = new Thing(1);
    const b = new Thing(1);
    const c = new Thing(2);
    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, c)).toBe(false);
  });
});
