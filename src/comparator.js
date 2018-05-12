// constants
import {HAS_MAP_SUPPORT, HAS_SET_SUPPORT} from './constants';

// utils
import {areIterablesEqual, isPromiseLike, isReactElement, sameValueZeroEqual} from './utils';

const createComparator = (createIsEqual) => {
  const isEqual = typeof createIsEqual === 'function' ? createIsEqual(comparator) : comparator; // eslint-disable-line

  /**
   * @function comparator
   *
   * @description
   * compare the value of the two objects and return true if they are equivalent in values
   *
   * @param {*} objectA the object to test against
   * @param {*} objectB the object to test
   * @param {Object|WeakSet} [cache] an optional cache to keep objects in
   * @returns {boolean} are objectA and objectB equivalent in value
   */
  function comparator(objectA, objectB, cache) {
    if (sameValueZeroEqual(objectA, objectB)) {
      return true;
    }

    const typeOfA = typeof objectA;

    if (typeOfA !== typeof objectB || typeOfA !== 'object' || !objectA || !objectB) {
      return false;
    }

    const arrayA = Array.isArray(objectA);
    const arrayB = Array.isArray(objectB);

    let index;

    if (arrayA || arrayB) {
      if (arrayA !== arrayB || objectA.length !== objectB.length) {
        return false;
      }

      for (index = 0; index < objectA.length; index++) {
        if (!isEqual(objectA[index], objectB[index], cache)) {
          return false;
        }
      }

      return true;
    }

    const dateA = objectA instanceof Date;
    const dateB = objectB instanceof Date;

    if (dateA || dateB) {
      return dateA === dateB && sameValueZeroEqual(objectA.getTime(), objectB.getTime());
    }

    const regexpA = objectA instanceof RegExp;
    const regexpB = objectB instanceof RegExp;

    if (regexpA || regexpB) {
      return (
        regexpA === regexpB &&
        objectA.source === objectB.source &&
        objectA.global === objectB.global &&
        objectA.ignoreCase === objectB.ignoreCase &&
        objectA.multiline === objectB.multiline &&
        objectA.lastIndex === objectB.lastIndex
      );
    }

    if (isPromiseLike(objectA) || isPromiseLike(objectB)) {
      return objectA === objectB;
    }

    if (HAS_MAP_SUPPORT) {
      const mapA = objectA instanceof Map;
      const mapB = objectB instanceof Map;

      if (mapA || mapB) {
        return mapA === mapB && areIterablesEqual(objectA, objectB, comparator, cache, true);
      }
    }

    if (HAS_SET_SUPPORT) {
      const setA = objectA instanceof Set;
      const setB = objectB instanceof Set;

      if (setA || setB) {
        return setA === setB && areIterablesEqual(objectA, objectB, comparator, cache, false);
      }
    }

    const keysA = Object.keys(objectA);

    if (keysA.length !== Object.keys(objectB).length) {
      return false;
    }

    let key;

    for (index = 0; index < keysA.length; index++) {
      key = keysA[index];

      if (!Object.prototype.hasOwnProperty.call(objectB, key)) {
        return false;
      }

      // if a react element, ignore the "_owner" key because its not necessary for equality comparisons
      if (key === '_owner' && isReactElement(objectA) && isReactElement(objectB)) {
        continue;
      }

      if (!isEqual(objectA[key], objectB[key], cache)) {
        return false;
      }
    }

    return true;
  }

  return comparator;
};

export default createComparator;
