import {
  EqualityComparator,
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  isPlainObject,
  isPromiseLike,
  sameValueZeroEqual,
} from './utils';

const HAS_MAP_SUPPORT = typeof Map === 'function';
const HAS_SET_SUPPORT = typeof Set === 'function';

type EqualityComparatorCreator = (fn: EqualityComparator) => EqualityComparator;

export function createComparator(createIsEqual?: EqualityComparatorCreator) {
  const isEqual: EqualityComparator =
    /* eslint-disable no-use-before-define */
    typeof createIsEqual === 'function'
      ? createIsEqual(comparator)
      : comparator;
  /* eslint-enable */

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

    if (a && b && typeof a === 'object' && typeof b === 'object') {
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

      return areObjectsEqual(a, b, isEqual, meta);
    }

    return a !== a && b !== b;
  }

  return comparator;
}
