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
 * @function toPairs
 *
 * @param {Map|Set} iterable the iterable to convert to [key, value] pairs (entries)
 * @returns {{keys: Array<*>, values: Array<*>}} the [key, value] pairs
 */
export const toPairs = (iterable) => {
  let pairs = {keys: new Array(iterable.size), values: new Array(iterable.size)},
      index = 0;

  iterable.forEach((value, key) => {
    pairs.keys[index] = key;
    pairs.values[index] = value;

    index++;
  });

  return pairs;
};
