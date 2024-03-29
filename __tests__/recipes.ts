import { createCustomEqual, sameValueZeroEqual } from '../src/index';

import type { CreateState, TypeEqualityComparator } from '../src/internalTypes';

describe('recipes', () => {
  describe('createCustomEqual', () => {
    describe('legacy-regexp-support', () => {
      const areRegExpsEqual = (a: RegExp, b: RegExp) => {
        return (
          a.source === b.source &&
          a.global === b.global &&
          a.ignoreCase === b.ignoreCase &&
          a.multiline === b.multiline &&
          a.unicode === b.unicode &&
          a.sticky === b.sticky &&
          a.lastIndex === b.lastIndex
        );
      };

      const deepEqual = createCustomEqual({
        createCustomConfig: () => ({ areRegExpsEqual }),
      });
      const shallowEqual = createCustomEqual({
        createCustomConfig: () => ({
          areRegExpsEqual,
          createIsNestedEqual: () => sameValueZeroEqual,
        }),
      });

      it('should verify the regexps correctly', () => {
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

      const areObjectsEqual: TypeEqualityComparator<SpecialObject> = (a, b) => {
        return a.foo === b.foo && a.bar.baz === b.bar.baz;
      };

      const spy = jest.fn(
        areObjectsEqual,
      ) as TypeEqualityComparator<SpecialObject>;

      const isSpecialObjectEqual = createCustomEqual({
        createCustomConfig: () => ({
          areObjectsEqual: spy,
        }),
      });

      it('should verify the special object', () => {
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

      const createState: CreateState<Meta> = () => ({ meta: { value: 'baz' } });

      const deepEqual = createCustomEqual<Meta>({
        createInternalComparator:
          (deepEqual) => (a, b, _keyA, _keyB, _parentA, _parentB, state) => {
            return (
              deepEqual(a, b, state) ||
              a === state.meta.value ||
              b === state.meta.value
            );
          },
        createState,
      });

      it('should verify the object itself', () => {
        const a = { bar: 'bar' };
        const b = { bar: 'bar' };
        const c = { bar: 'quz' };

        expect(deepEqual(a, b)).toBe(true);
        expect(deepEqual(a, c)).toBe(false);
      });

      it('should verify the object against meta', () => {
        const a = { foo: 'bar', bar: 'baz' };
        const b = { foo: 'bar', bar: 'baz' };
        const c = { foo: 'bar', bar: 'quz' };

        expect(deepEqual(a, b)).toBe(true);
        expect(deepEqual(a, c)).toBe(true);
        expect(deepEqual(a, {})).toBe(false);
      });
    });

    describe('non-standard-properties', () => {
      const symbolKey = Symbol('key');

      function createObjectWithDifferentPropertyTypes(value: string) {
        const object: Record<any, any> = {
          [symbolKey]: 'symbol',
        };

        Object.defineProperty(object, 'hidden', {
          enumerable: false,
          writable: true,
          value,
        });

        return object;
      }

      const areObjectsEqual: TypeEqualityComparator<Record<any, any>> = (
        a,
        b,
      ) => {
        const propertiesA = [
          ...Object.getOwnPropertyNames(a),
          ...Object.getOwnPropertySymbols(a),
        ];
        const propertiesB = [
          ...Object.getOwnPropertyNames(b),
          ...Object.getOwnPropertySymbols(b),
        ];

        if (propertiesA.length !== propertiesB.length) {
          return false;
        }

        return propertiesA.every(
          (property) => a[property as any] === b[property as any],
        );
      };

      const deepEqual = createCustomEqual({
        createCustomConfig: () => ({ areObjectsEqual }),
      });

      it('should verify the object with non-standard properties', () => {
        const a = createObjectWithDifferentPropertyTypes('bar');
        const b = createObjectWithDifferentPropertyTypes('bar');
        const c = createObjectWithDifferentPropertyTypes('baz');

        expect(deepEqual(a, b)).toBe(true);
        expect(deepEqual(a, c)).toBe(false);
        expect(deepEqual(a, {})).toBe(false);
      });
    });

    describe('strict-property-descriptor-check', () => {
      const areObjectsEqual: TypeEqualityComparator<Record<any, any>> = (
        a,
        b,
      ) => {
        const propertiesA = [
          ...Object.getOwnPropertyNames(a),
          ...Object.getOwnPropertySymbols(a),
        ];
        const propertiesB = [
          ...Object.getOwnPropertyNames(b),
          ...Object.getOwnPropertySymbols(b),
        ];

        if (propertiesA.length !== propertiesB.length) {
          return false;
        }

        return propertiesA.every((property) => {
          const descriptorA = Object.getOwnPropertyDescriptor(a, property);
          const descriptorB = Object.getOwnPropertyDescriptor(b, property);

          return (
            descriptorA &&
            descriptorB &&
            descriptorA.configurable === descriptorB.configurable &&
            descriptorA.enumerable === descriptorB.enumerable &&
            descriptorA.value === descriptorB.value &&
            descriptorA.writable === descriptorB.writable
          );
        });
      };

      const deepEqual = createCustomEqual({
        createCustomConfig: () => ({ areObjectsEqual }),
      });

      it('should verify the object property descriptors', () => {
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

    describe("special-objects", () => {
      it("should call unknownTagComparators", () => {
        // Emulate something like a private property
        const hiddenData = new WeakMap<Thing, number>();
        const tag = "Thing";

        class Thing {
          [Symbol.toStringTag] = tag
          constructor(value: number) {
            hiddenData.set(this, value);
          }
          equals(other: Thing) {
            return hiddenData.get(this) === hiddenData.get(other);
          }
        }

        const deepEqual = createCustomEqual({
          createCustomConfig: () => ({ 
            unknownTagComparators: {
              [tag]: (a, b) => a instanceof Thing && b instanceof Thing && a.equals(b)
            }
          }),
        });

        const a = new Thing(1);
        const b = new Thing(1);
        const c = new Thing(2);
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
  });
});
