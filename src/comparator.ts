import { areRegExpsEqual } from "./primitives";
import { isPlainObject, isPromiseLike, sameValueZeroEqual } from "./utils";

import type { areArraysEqual } from "./arrays";
import type { areMapsEqual } from "./maps";
import type { areObjectsEqual } from "./objects";
import type { areSetsEqual } from "./sets";
import type { EqualityComparator, InternalEqualityComparator } from "./utils";

export type CreateMeta<Meta> = () => Meta;

export interface CreateComparatorCreatorOptions<Meta> {
  areArraysEqual: typeof areArraysEqual;
  areMapsEqual: typeof areMapsEqual;
  areObjectsEqual: typeof areObjectsEqual;
  areSetsEqual: typeof areSetsEqual;
  createMeta: CreateMeta<Meta>;
}

export type EqualityComparatorCreator = (
  fn: EqualityComparator
) => InternalEqualityComparator;

const HAS_MAP_SUPPORT = typeof Map === "function";
const HAS_SET_SUPPORT = typeof Set === "function";

const { valueOf } = Object.prototype;

export function createComparatorCreator<Meta>({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
  createMeta,
}: CreateComparatorCreatorOptions<Meta>) {
  return function createComparator(
    createIsEqual?: EqualityComparatorCreator
  ): EqualityComparator {
    const isEqual: InternalEqualityComparator =
      /* eslint-disable no-use-before-define */
      typeof createIsEqual === "function"
        ? createIsEqual(comparator)
        : (
            a: any,
            b: any,
            indexOrKeyA: any,
            indexOrKeyB: any,
            parentA: any,
            parentB: any,
            meta: any
          ) => comparator(a, b, meta);
    /* eslint-enable */

    /**
     * compare the value of the two objects and return true if they are equivalent in values
     *
     * @param a the value to test against
     * @param b the value to test
     * @param [meta] an optional meta object that is passed through to all equality test calls
     * @returns are a and b equivalent in value
     */
    function comparator(a: any, b: any, meta: any) {
      if (a === b) {
        return true;
      }

      if (a && b && typeof a === "object" && typeof b === "object") {
        if (isPlainObject(a) && isPlainObject(b)) {
          return areObjectsEqual(a, b, isEqual, meta);
        }

        let aShape = Array.isArray(a);
        let bShape = Array.isArray(b);

        if (aShape || bShape) {
          return aShape === bShape && areArraysEqual(a, b, isEqual, meta);
        }

        aShape = a instanceof Date;
        bShape = b instanceof Date;

        if (aShape || bShape) {
          return (
            aShape === bShape && sameValueZeroEqual(a.getTime(), b.getTime())
          );
        }

        aShape = a instanceof RegExp;
        bShape = b instanceof RegExp;

        if (aShape || bShape) {
          return aShape === bShape && areRegExpsEqual(a, b);
        }

        if (isPromiseLike(a) || isPromiseLike(b)) {
          return a === b;
        }

        if (HAS_MAP_SUPPORT) {
          aShape = a instanceof Map;
          bShape = b instanceof Map;

          if (aShape || bShape) {
            return aShape === bShape && areMapsEqual(a, b, isEqual, meta);
          }
        }

        if (HAS_SET_SUPPORT) {
          aShape = a instanceof Set;
          bShape = b instanceof Set;

          if (aShape || bShape) {
            return aShape === bShape && areSetsEqual(a, b, isEqual, meta);
          }
        }

        if (a.valueOf !== valueOf || b.valueOf !== valueOf) {
          return sameValueZeroEqual(a.valueOf(), b.valueOf());
        }

        return areObjectsEqual(a, b, isEqual, meta);
      }

      return a !== a && b !== b;
    }

    return function (a: any, b: any) {
      return comparator(a, b, createMeta());
    };
  };
}
