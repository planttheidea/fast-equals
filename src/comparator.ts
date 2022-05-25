import { areRegExpsEqual } from "./primitives";
import {
  isPlainObject,
  isPromiseLike,
  isPrimitiveWrapper,
  sameValueZeroEqual,
} from "./utils";

import type { areArraysEqual } from "./arrays";
import type { areMapsEqual } from "./maps";
import type { areObjectsEqual } from "./objects";
import type { areSetsEqual } from "./sets";
import type { EqualityComparator, InternalEqualityComparator } from "./utils";

export interface CreateComparatorCreatorOptions<Meta> {
  areArraysEqual: typeof areArraysEqual;
  areMapsEqual: typeof areMapsEqual;
  areObjectsEqual: typeof areObjectsEqual;
  areSetsEqual: typeof areSetsEqual;
}

export type EqualityComparatorCreator = (
  fn: EqualityComparator
) => InternalEqualityComparator;

function createDefaultIsEqual(comparator: EqualityComparator) {
  return function isEqual(
    a: any,
    b: any,
    indexOrKeyA: any,
    indexOrKeyB: any,
    parentA: any,
    parentB: any,
    meta: any
  ) {
    return comparator(a, b, meta);
  };
}

export function createComparatorCreator<Meta>({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
}: CreateComparatorCreatorOptions<Meta>) {
  return function createComparator(
    createIsEqual: EqualityComparatorCreator = createDefaultIsEqual
  ): EqualityComparator {
    const isEqual = createIsEqual(comparator);

    /**
     * compare the value of the two objects and return true if they are equivalent in values
     *
     * @param a the value to test against
     * @param b the value to test
     * @param [meta] an optional meta object that is passed through to all equality test calls
     * @returns are a and b equivalent in value
     */
    function comparator(a: any, b: any, meta?: any) {
      if (a === b) {
        return true;
      }

      if (!a || !b || typeof a !== "object" || typeof b !== "object") {
        return a !== a && b !== b;
      }

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

      aShape = a instanceof Map;
      bShape = b instanceof Map;

      if (aShape || bShape) {
        return aShape === bShape && areMapsEqual(a, b, isEqual, meta);
      }

      aShape = a instanceof Set;
      bShape = b instanceof Set;

      if (aShape || bShape) {
        return aShape === bShape && areSetsEqual(a, b, isEqual, meta);
      }

      if (isPromiseLike(a) || isPromiseLike(b)) {
        return a === b;
      }

      if (isPrimitiveWrapper(a) || isPrimitiveWrapper(b)) {
        return sameValueZeroEqual(a.valueOf(), b.valueOf());
      }

      return areObjectsEqual(a, b, isEqual, meta);
    }

    return comparator;
  };
}
