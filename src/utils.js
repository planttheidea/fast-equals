export const createIsStrictlyEqual = () => {
  /**
   * @function isStrictlyEqual
   *
   * @description
   * are the objects passed strictly equal
   *
   * @param {*} objectA the object to compare against
   * @param {*} objectB the object to test
   * @returns {boolean} are the objects strictly equal
   */
  return (objectA, objectB) => {
    return objectA === objectB;
  };
};

/**
 * @function isFunction
 *
 * @description
 * is the object passed a function
 *
 * @param {*} object the object to test
 * @returns {boolean} is the value a function
 */
export const isFunction = (object) => {
  return typeof object === 'function';
};

/**
 * @function isNAN
 *
 * @description
 * is the object passed NaN
 *
 * @param {*} object the object to test
 * @returns {boolean} is the object NaN
 */
export const isNAN = (object) => {
  return object !== object;
};

/**
 * @function toPairs
 *
 * @param {Map|Set} iterable the iterable to convert to [key, value] pairs (entries)
 * @returns {Array<Array>} the [key, value] pairs
 */
export const toPairs = (iterable) => {
  let keys = [],
      values = [],
      index = 0;

  iterable.forEach((value, key) => {
    keys[index] = key;
    values[index] = value;

    index++;
  });

  return {keys, values};
};
