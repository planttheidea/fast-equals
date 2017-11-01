export const createIsSameValueZero = () => {
  /**
   * @function isSameValueZero
   *
   * @description
   * are the objects passed strictly equal or both NaN
   *
   * @param {*} objectA the object to compare against
   * @param {*} objectB the object to test
   * @returns {boolean} are the objects equal by the SameValueZero principle
   */
  return (objectA, objectB) => {
    return objectA === objectB || (objectA !== objectA && objectB !== objectB);
  };
};

/**
 * @function toPairs
 *
 * @param {Map|Set} iterable the iterable to convert to [key, value] pairs (entries)
 * @returns {{keys: Array<*>, values: Array<*>}} the [key, value] pairs
 */
export const toPairs = (iterable) => {
  const pairs = {keys: new Array(iterable.size), values: new Array(iterable.size)};

  let index = 0;

  iterable.forEach((value, key) => {
    pairs.keys[index] = key;
    pairs.values[index++] = value;
  });

  return pairs;
};

/**
 * @function areIterablesEqual
 *
 * @description
 * determine if the iterables are equivalent in value
 *
 * @param {Map|Set} objectA the object to test
 * @param {Map|Set} objectB the object to test against
 * @param {function} comparator the comparator to determine deep equality
 * @param {boolean} shouldCompareKeys should the keys be tested in the equality comparison
 * @returns {boolean} are the objects equal in value
 */
export const areIterablesEqual = (objectA, objectB, comparator, shouldCompareKeys) => {
  if (objectA.size !== objectB.size) {
    return false;
  }

  const pairsA = toPairs(objectA);
  const pairsB = toPairs(objectB);

  return shouldCompareKeys
    ? comparator(pairsA.keys, pairsB.keys) && comparator(pairsA.values, pairsB.values)
    : comparator(pairsA.values, pairsB.values);
};
