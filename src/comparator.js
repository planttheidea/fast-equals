// utils
import {toPairs} from './utils';

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

      const iterableA = typeof objectA.forEach === 'function';
      const iterableB = typeof objectB.forEach === 'function';

      if (iterableA || iterableB) {
        if (iterableA !== iterableB || objectA.size !== objectB.size) {
          return false;
        }

        const pairsA = toPairs(objectA);
        const pairsB = toPairs(objectB);

        return comparator(pairsA.keys, pairsB.keys) && comparator(pairsA.values, pairsB.values);
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
