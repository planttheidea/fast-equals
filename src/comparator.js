// utils
import {isFunction, isNAN, toPairs} from './utils';

const createComparator = (createIsEqual) => {
  const isEqualComparator = isFunction(createIsEqual) ? createIsEqual(comparator) : comparator; // eslint-disable-line

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

      let index = 0;

      if (arrayA || arrayB) {
        if (arrayA !== arrayB || objectA.length !== objectB.length) {
          return false;
        }

        while (index < objectA.length) {
          if (!isEqualComparator(objectA[index], objectB[index])) {
            return false;
          }

          index++;
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

      if (isFunction(objectA.forEach)) {
        if (!isFunction(objectB.forEach)) {
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

      let keyA;

      while (index < keysA.length) {
        keyA = keysA[index];

        if (!Object.prototype.hasOwnProperty.call(objectB, keyA) || !isEqualComparator(objectA[keyA], objectB[keyA])) {
          return false;
        }

        index++;
      }

      return true;
    }

    return isNAN(objectA) && isNAN(objectB);
  }

  return comparator;
};

export default createComparator;
