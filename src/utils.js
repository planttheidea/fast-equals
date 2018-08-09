// constants
import {HAS_WEAKSET_SUPPORT} from './constants';

const keys = Object.keys;

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
 * @function hasItem
 *
 * @description
 * does the array include the item passed
 *
 * @param {Array<any>} array the array to check in
 * @param {any} item the item to locate
 * @param {function} isEqual the equality comparator
 * @param {any} meta the meta item to pass through
 * @returns {boolean} does the item exist in the array
 */
export const hasItem = (array, item, isEqual, meta) => {
  for (let index = 0; index < array.length; index++) {
    if (isEqual(array[index], item, meta)) {
      return true;
    }
  }

  return false;
};

/**
 * @function hasItems
 *
 * @description
 * are the arrays equal in value, despite being in different order
 *
 * @param {Array<any>} arrayA the first array to test
 * @param {Array<any>} arrayB the second array to test
 * @param {function} isEqual the equality comparator
 * @param {any} meta the meta item to pass through
 * @returns {boolean} are the arrays equal absent order
 */
export const hasItems = (arrayA, arrayB, isEqual, meta) => {
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  for (let index = 0; index < arrayA.length; index++) {
    if (!hasItem(arrayB, arrayA[index], isEqual, meta)) {
      return false;
    }
  }

  return true;
};

/**
 * @function sameValueZeroEqual
 *
 * @description
 * are the objects passed strictly equal or both NaN
 *
 * @param {any} objectA the object to compare against
 * @param {any} objectB the object to test
 * @returns {boolean} are the objects equal by the SameValueZero principle
 */
export const sameValueZeroEqual = (objectA, objectB) =>
  objectA === objectB || (objectA !== objectA && objectB !== objectB);

/**
 * @function isPlainObject
 *
 * @description
 * is the object a plain object
 *
 * @param {any} object the object to test
 * @returns {boolean} is the object a plain object
 */
export const isPlainObject = (object) => object.constructor === Object;

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
      },
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

  return (objectA, objectB, cache = getNewCache()) => {
    const cacheHasA = cache.has(objectA);
    const cacheHasB = cache.has(objectB);

    if (cacheHasA || cacheHasB) {
      return cacheHasA && cacheHasB;
    }

    addObjectToCache(objectA, cache);
    addObjectToCache(objectB, cache);

    return comparator(objectA, objectB, cache);
  };
};

/**
 * @function toPairs
 *
 * @param {Map|Set} iterable the iterable to convert to [key, value] pairs (entries)
 * @returns {{keys: Array<*>, values: Array<*>}} the [key, value] pairs
 */
export const toPairs = (iterable) => {
  const pairs = {
    keys: [],
    values: [],
  };

  iterable.forEach((value, key) => pairs.keys.push(key) && pairs.values.push(value));

  return pairs;
};

/**
 * @function areArraysEqual
 *
 * @description
 * are the arrays equal in value
 *
 * @param {Array<any>} arrayA the array to test
 * @param {Array<any>} arrayB the array to test against
 * @param {function} isEqual the comparator to determine equality
 * @param {any} meta the meta object to pass through
 * @returns {boolean} are the arrays equal
 */
export const areArraysEqual = (arrayA, arrayB, isEqual, meta) => {
  if (arrayA.length !== arrayB.length) {
    return false;
  }

  for (let index = 0; index < arrayA.length; index++) {
    if (!isEqual(arrayA[index], arrayB[index], meta)) {
      return false;
    }
  }

  return true;
};

export const createAreIterablesEqual = (shouldCompareKeys) => {
  /**
   * @function areIterablesEqual
   *
   * @description
   * determine if the iterables are equivalent in value
   *
   * @param {Array<Array<any>>} pairsA the pairs to test
   * @param {Array<Array<any>>} pairsB the pairs to test against
   * @param {function} isEqual the comparator to determine equality
   * @param {any} meta the cache possibly being used
   * @returns {boolean} are the objects equal in value
   */
  const areIterablesEqual = shouldCompareKeys
    ? (pairsA, pairsB, isEqual, meta) =>
      hasItems(pairsA.keys, pairsB.keys, isEqual, meta) && hasItems(pairsA.values, pairsB.values, isEqual, meta)
    : (pairsA, pairsB, isEqual, meta) => hasItems(pairsA.values, pairsB.values, isEqual, meta);

  return (iterableA, iterableB, isEqual, meta) =>
    areIterablesEqual(toPairs(iterableA), toPairs(iterableB), isEqual, meta);
};

/**
 * @function areArraysEqual
 *
 * @description
 * are the objects equal in value
 *
 * @param {Array<any>} objectA the object to test
 * @param {Array<any>} objectB the object to test against
 * @param {function} isEqual the comparator to determine equality
 * @param {any} meta the meta object to pass through
 * @returns {boolean} are the objects equal
 */
export const areObjectsEqual = (objectA, objectB, isEqual, meta) => {
  const keysA = keys(objectA);
  const keysB = keys(objectB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  let key;

  for (let index = 0; index < keysA.length; index++) {
    key = keysA[index];

    if (!hasItem(keysB, key, sameValueZeroEqual)) {
      return false;
    }

    // if a react element, ignore the "_owner" key because its not necessary for equality comparisons
    if (key === '_owner' && isReactElement(objectA) && isReactElement(objectB)) {
      continue;
    }

    if (!isEqual(objectA[key], objectB[key], meta)) {
      return false;
    }
  }

  return true;
};

/**
 * @function areRegExpsEqual
 *
 * @description
 * are the regExps equal in value
 *
 * @param {RegExp} regExpA the regExp to test
 * @param {RegExp} regExpB the regExp to test agains
 * @returns {boolean} are the regExps equal
 */
export const areRegExpsEqual = (regExpA, regExpB) =>
  regExpA.source === regExpB.source
  && regExpA.global === regExpB.global
  && regExpA.ignoreCase === regExpB.ignoreCase
  && regExpA.multiline === regExpB.multiline
  && regExpA.unicode === regExpB.unicode
  && regExpA.sticky === regExpB.sticky
  && regExpA.lastIndex === regExpB.lastIndex;
