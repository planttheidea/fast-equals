// constants
import {HAS_WEAKSET_SUPPORT} from './constants';

/**
 * @function addObjectToCache
 *
 * @description
 * add object to cache if it is indeed an object
 *
 * @param {any} object the object to potentially add to the cache
 * @param {Object|WeakSet} cache the cache to add to
 * @returns {void}
 */
export const addObjectToCache = (object, cache) => object && typeof object === 'object' && cache.add(object);

/**
 * @function sameValueZeroEqual
 *
 * @description
 * are the objects passed strictly equal or both NaN
 *
 * @param {*} objectA the object to compare against
 * @param {*} objectB the object to test
 * @returns {boolean} are the objects equal by the SameValueZero principle
 */
export const sameValueZeroEqual = (objectA, objectB) =>
  objectA === objectB || (objectA !== objectA && objectB !== objectB);

/**
 * @function isPromiseLike
 *
 * @description
 * is the object promise-like (thenable)
 *
 * @param {any} object the object to test
 * @returns {boolean} is the object promise-like
 */
export const isPromiseLike = (object) => typeof object.then === 'function';

/**
 * @function isReactElement
 *
 * @description
 * is the object passed a react element
 *
 * @param {any} object the object to test
 * @returns {boolean} is the object a react element
 */
export const isReactElement = (object) => !!(object.$$typeof && object._store);

/**
 * @function getNewCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns {Object|Weakset} the new cache object
 */
export const getNewCache = () =>
  HAS_WEAKSET_SUPPORT
    ? new WeakSet()
    : Object.create({
      _values: [],
      add(value) {
        this._values.push(value);
      },
      has(value) {
        return !!~this._values.indexOf(value);
      }
    });

/**
 * @function createCircularEqual
 *
 * @description
 * create a custom isEqual handler specific to circular objects
 *
 * @param {funtion} [isEqual] the isEqual comparator to use instead of isDeepEqual
 * @returns {function(any, any): boolean}
 */
export const createCircularEqual = (isEqual) => (isDeepEqual) => {
  const comparator = isEqual || isDeepEqual;
  const cache = getNewCache();

  return (objectA, objectB) => {
    const cacheHasA = cache.has(objectA);
    const cacheHasB = cache.has(objectB);

    if (cacheHasA || cacheHasB) {
      return cacheHasA && cacheHasB;
    }

    addObjectToCache(objectA, cache);
    addObjectToCache(objectB, cache);

    return comparator(objectA, objectB);
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
