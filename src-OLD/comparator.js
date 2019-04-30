// constants
import { HAS_MAP_SUPPORT, HAS_SET_SUPPORT } from './constants';

// utils
import {
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  isPlainObject,
  isPromiseLike,
  sameValueZeroEqual,
} from './utils';

const isArray = Array.isArray;

const createComparator = (createIsEqual) => {
  // eslint-disable-next-line no-use-before-define
  const isEqual =
    typeof createIsEqual === 'function'
      ? createIsEqual(comparator)
      : comparator;

  /**
   * @function comparator
   *
   * @description
   * compare the value of the two objects and return true if they are equivalent in values
   *
   * @param {any} objectA the object to test against
   * @param {any} objectB the object to test
   * @param {any} [meta] an optional meta object that is passed through to all equality test calls
   * @returns {boolean} are objectA and objectB equivalent in value
   */
  function comparator(objectA, objectB, meta) {
    if (sameValueZeroEqual(objectA, objectB)) {
      return true;
    }

    const typeOfA = typeof objectA;

    if (
      typeOfA !== typeof objectB ||
      typeOfA !== 'object' ||
      !objectA ||
      !objectB
    ) {
      return false;
    }

    if (isPlainObject(objectA) && isPlainObject(objectB)) {
      return areObjectsEqual(objectA, objectB, isEqual, meta);
    }

    const arrayA = isArray(objectA);
    const arrayB = isArray(objectB);

    if (arrayA || arrayB) {
      return (
        arrayA === arrayB && areArraysEqual(objectA, objectB, isEqual, meta)
      );
    }

    const dateA = objectA instanceof Date;
    const dateB = objectB instanceof Date;

    if (dateA || dateB) {
      return (
        dateA === dateB &&
        sameValueZeroEqual(objectA.getTime(), objectB.getTime())
      );
    }

    const regexpA = objectA instanceof RegExp;
    const regexpB = objectB instanceof RegExp;

    if (regexpA || regexpB) {
      return regexpA === regexpB && areRegExpsEqual(objectA, objectB);
    }

    if (isPromiseLike(objectA) || isPromiseLike(objectB)) {
      return objectA === objectB;
    }

    if (HAS_MAP_SUPPORT) {
      const mapA = objectA instanceof Map;
      const mapB = objectB instanceof Map;

      if (mapA || mapB) {
        return mapA === mapB && areMapsEqual(objectA, objectB, isEqual, meta);
      }
    }

    if (HAS_SET_SUPPORT) {
      const setA = objectA instanceof Set;
      const setB = objectB instanceof Set;

      if (setA || setB) {
        return setA === setB && areSetsEqual(objectA, objectB, isEqual, meta);
      }
    }

    return areObjectsEqual(objectA, objectB, isEqual, meta);
  }

  return comparator;
};

export default createComparator;
