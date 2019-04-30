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
  toString,
} from './utils';

const { isArray } = Array;

const DATE_CLASS = '[object Date]';
const MAP_CLASS = '[object Map]';
const REG_EXP_CLASS = '[object RegExp]';
const SET_CLASS = '[object Set]';

type EqualityComparatorCreator = (fn: EqualityComparator) => EqualityComparator;

export function createComparator(createIsEqual?: EqualityComparatorCreator) {
  const isEqual: EqualityComparator =
    /* eslint-disable no-use-before-define */
    typeof createIsEqual === 'function'
      ? createIsEqual(comparator)
      : comparator;
  /* eslint-enable */

  function comparator(a: any, b: any, meta?: any) {
    if (sameValueZeroEqual(a, b)) {
      return true;
    }

    const typeofA = typeof a;

    if (typeofA !== typeof b || typeofA !== 'object' || !a || !b) {
      return false;
    }

    if (isPlainObject(a) && isPlainObject(b)) {
      return areObjectsEqual(a, b, isEqual, meta);
    }

    const arrayA = isArray(a);
    const arrayB = isArray(b);

    if (arrayA || arrayB) {
      return arrayA === arrayB && areArraysEqual(a, b, isEqual, meta);
    }

    const aClass = toString(a);
    const bClass = toString(b);

    if (aClass === DATE_CLASS || bClass === DATE_CLASS) {
      return aClass === bClass && sameValueZeroEqual(a.getTime(), b.getTime());
    }

    if (aClass === REG_EXP_CLASS || bClass === REG_EXP_CLASS) {
      return aClass === bClass && areRegExpsEqual(a, b);
    }

    if (isPromiseLike(a) || isPromiseLike(b)) {
      return a === b;
    }

    if (aClass === MAP_CLASS || bClass === MAP_CLASS) {
      return aClass === bClass && areMapsEqual(a, b, isEqual, meta);
    }

    if (aClass === SET_CLASS || bClass === SET_CLASS) {
      return aClass === bClass && areSetsEqual(a, b, isEqual, meta);
    }

    return areObjectsEqual(a, b, isEqual, meta);
  }

  return comparator;
}
