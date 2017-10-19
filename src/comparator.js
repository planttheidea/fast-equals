// utils
import {areIterablesEqual, toPairs} from './utils';

const HAS_MAP_SUPPORT = typeof Map === 'function';
const HAS_SET_SUPPORT = typeof Set === 'function';

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
   * @returns {boolean} are objectA and objectB equivalent in value
   */
  function comparator(objectA, objectB) {
    if (objectA === objectB) {
      return true;
    }

    const typeOfA = typeof objectA;

    if (typeOfA !== typeof objectB) {
      return false;
    }

    if (typeOfA === 'object' && objectA && objectB) {
      const arrayA = Array.isArray(objectA);
      const arrayB = Array.isArray(objectB);

      let index;

      if (arrayA || arrayB) {
        if (arrayA !== arrayB || objectA.length !== objectB.length) {
          return false;
        }

        for (index = 0; index < objectA.length; index++) {
          if (!isEqual(objectA[index], objectB[index])) {
            return false;
          }
        }

        return true;
      }

      const dateA = objectA instanceof Date;
      const dateB = objectB instanceof Date;

      if (dateA || dateB) {
        return dateA === dateB && objectA.getTime() === objectB.getTime();
      }

      const regexpA = objectA instanceof RegExp;
      const regexpB = objectB instanceof RegExp;

      if (regexpA || regexpB) {
        return (
          regexpA === regexpB &&
          objectA.source === objectB.source &&
          objectA.global === objectB.global &&
          objectA.ignoreCase === objectB.ignoreCase &&
          objectA.multiline === objectB.multiline
        );
      }

      if (HAS_MAP_SUPPORT) {
        const mapA = objectA instanceof Map;
        const mapB = objectB instanceof Map;

        if (mapA || mapB) {
          return mapA === mapB && areIterablesEqual(objectA, objectB, comparator);
        }
      }

      if (HAS_SET_SUPPORT) {
        const setA = objectA instanceof Set;
        const setB = objectB instanceof Set;

        if (setA || setB) {
          return setA === setB && areIterablesEqual(objectA, objectB, comparator);
        }
      }

      const keysA = Object.keys(objectA);

      if (keysA.length !== Object.keys(objectB).length) {
        return false;
      }

      let key;

      for (index = 0; index < keysA.length; index++) {
        key = keysA[index];

        if (!Object.prototype.hasOwnProperty.call(objectB, key) || !isEqual(objectA[key], objectB[key])) {
          return false;
        }
      }

      return true;
    }

    return objectA !== objectA && objectB !== objectB;
  }

  return comparator;
};

export default createComparator;
