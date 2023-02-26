import {
  areArraysEqual as areArraysEqualDefault,
  areDatesEqual as areDatesEqualDefault,
  areMapsEqual as areMapsEqualDefault,
  areObjectsEqual as areObjectsEqualDefault,
  areObjectsEqualStrict as areObjectsEqualStrictDefault,
  arePrimitiveWrappersEqual as arePrimitiveWrappersEqualDefault,
  areRegExpsEqual as areRegExpsEqualDefault,
  areSetsEqual as areSetsEqualDefault,
  areTypedArraysEqual,
} from './equals';
import { combineComparators, createIsCircular, isArrayBuffer } from './utils';
import type {
  ComparatorConfig,
  CustomEqualCreatorOptions,
  EqualityComparator,
  State,
} from './internalTypes';

const ARGUMENTS_TAG = '[object Arguments]';
const BOOLEAN_TAG = '[object Boolean]';
const DATE_TAG = '[object Date]';
const MAP_TAG = '[object Map]';
const NUMBER_TAG = '[object Number]';
const OBJECT_TAG = '[object Object]';
const REG_EXP_TAG = '[object RegExp]';
const SET_TAG = '[object Set]';
const STRING_TAG = '[object String]';

const { isArray } = Array;
const { assign } = Object;
const getTag = Object.prototype.toString.call.bind(
  Object.prototype.toString,
) as (a: object) => string;

/**
 * Create a comparator method based on the type-specific equality comparators passed.
 */
export function createComparator<Meta>({
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
  areTypedArraysEqual,
}: ComparatorConfig<Meta>): EqualityComparator<Meta> {
  /**
   * compare the value of the two objects and return true if they are equivalent in values
   */
  return function comparator(a: any, b: any, state: State<Meta>): boolean {
    // If the items are strictly equal, no need to do a value comparison.
    if (a === b) {
      return true;
    }

    // If the items are not non-nullish objects, then the only possibility
    // of them being equal but not strictly is if they are both `NaN`. Since
    // `NaN` is uniquely not equal to itself, we can use self-comparison of
    // both objects, which is faster than `isNaN()`.
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return a !== a && b !== b;
    }

    if (state.strict && a.constructor !== b.constructor) {
      return false;
    }

    // Checks are listed in order of commonality of use-case:
    //   1. Common complex object types (plain object, array)
    //   2. Common data values (date, regexp)
    //   3. Less-common complex object types (map, set)
    //   4. Less-common data values (promise, primitive wrappers)
    // Inherently this is both subjective and assumptive, however
    // when reviewing comparable libraries in the wild this order
    // appears to be generally consistent.

    // `isPlainObject` only checks against the object's own realm. Cross-realm
    // comparisons are rare, and will be handled in the ultimate fallback, so
    // we can avoid the `toString.call()` cost unless necessary.
    if (a.constructor === Object && b.constructor === Object) {
      return areObjectsEqual(a, b, state);
    }

    // `isArray()` works on subclasses and is cross-realm, so we can again avoid
    // the `toString.call()` cost unless necessary by just checking if either
    // and then both are arrays.
    let aArray = isArray(a);
    let bArray = isArray(b);

    if (aArray || bArray) {
      return aArray === bArray && areArraysEqual(a, b, state);
    }

    aArray = isArrayBuffer(a);
    bArray = isArrayBuffer(b);

    if (aArray || bArray) {
      return aArray === bArray && areTypedArraysEqual(a, b, state);
    }

    // Since this is a custom object, use the classic `toString.call()` to get its
    // type. This is reasonably performant in modern environments like v8 and
    // SpiderMonkey, and allows for cross-realm comparison when other checks like
    // `instanceof` do not.
    const tag = getTag(a);

    if (tag !== getTag(b)) {
      return false;
    }

    if (tag === DATE_TAG) {
      return areDatesEqual(a, b, state);
    }

    if (tag === REG_EXP_TAG) {
      return areRegExpsEqual(a, b, state);
    }

    if (tag === MAP_TAG) {
      return areMapsEqual(a, b, state);
    }

    if (tag === SET_TAG) {
      return areSetsEqual(a, b, state);
    }

    // If a simple object tag, then we can prioritize a simple object comparison because
    // it is likely a custom class.
    if (tag === OBJECT_TAG) {
      // The exception for value comparison is `Promise`-like contracts. These should be
      // treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      return (
        typeof a.then !== 'function' &&
        typeof b.then !== 'function' &&
        areObjectsEqual(a, b, state)
      );
    }

    // If an arguments tag, it should be treated as a standard object.
    if (tag === ARGUMENTS_TAG) {
      return areObjectsEqual(a, b, state);
    }

    // As the penultimate fallback, check if the values passed are primitive wrappers. This
    // is very rare in modern JS, which is why it is deprioritized compared to all other object
    // types.
    if (tag === BOOLEAN_TAG || tag === NUMBER_TAG || tag === STRING_TAG) {
      return arePrimitiveWrappersEqual(a, b, state);
    }

    // If not matching any tags that require a specific type of comparison, then we hard-code false because
    // the only thing remaining is strict equality, which has already been compared. This is for a few reasons:
    //   - Certain types that cannot be introspected (e.g., `WeakMap`). For these types, this is the only
    //     comparison that can be made.
    //   - For types that can be introspected, but rarely have requirements to be compared
    //     (`ArrayBuffer`, `DataView`, etc.), the cost is avoided to prioritize the common
    //     use-cases (may be included in a future release, if requested enough).
    //   - For types that can be introspected but do not have an objective definition of what
    //     equality is (`Error`, etc.), the subjective decision is to be conservative and strictly compare.
    // In all cases, these decisions should be reevaluated based on changes to the language and
    // common development practices.
    return false;
  };
}

/**
 * Create the configuration object used for building comparators.
 */
export function createComparatorConfig<Meta>({
  circular,
  createCustomConfig,
  strict,
}: CustomEqualCreatorOptions<Meta>): ComparatorConfig<Meta> {
  let config = {
    areArraysEqual: strict
      ? areObjectsEqualStrictDefault
      : areArraysEqualDefault,
    areDatesEqual: areDatesEqualDefault,
    areMapsEqual: strict
      ? combineComparators(areMapsEqualDefault, areObjectsEqualStrictDefault)
      : areMapsEqualDefault,
    areObjectsEqual: strict
      ? areObjectsEqualStrictDefault
      : areObjectsEqualDefault,
    arePrimitiveWrappersEqual: arePrimitiveWrappersEqualDefault,
    areRegExpsEqual: areRegExpsEqualDefault,
    areSetsEqual: strict
      ? combineComparators(areSetsEqualDefault, areObjectsEqualStrictDefault)
      : areSetsEqualDefault,
    areTypedArraysEqual: strict
      ? combineComparators(areTypedArraysEqual, areObjectsEqualStrictDefault)
      : areTypedArraysEqual,
  };

  if (createCustomConfig) {
    config = assign({}, config, createCustomConfig(config));
  }

  if (circular) {
    const areArraysEqual = createIsCircular(config.areArraysEqual);
    const areMapsEqual = createIsCircular(config.areMapsEqual);
    const areObjectsEqual = createIsCircular(config.areObjectsEqual);
    const areSetsEqual = createIsCircular(config.areSetsEqual);

    config = assign({}, config, {
      areArraysEqual,
      areMapsEqual,
      areObjectsEqual,
      areSetsEqual,
    });
  }

  return config;
}
