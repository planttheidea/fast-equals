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
 *
 * @param {Array<Array<any>>} pairs the pairs to check in
 * @param {Array<any>} pairToMatch the pair to check if exists
 * @param {function} isEqual the equality comparator
 * @param {any} meta the meta item to pass through
 * @returns {boolean} does the pair exist in the pairs
 */
export const hasPair = (pairs, pairToMatch, isEqual, meta) => {
  let pair;

  for (let index = 0; index < pairs.length; index++) {
    pair = pairs[index];

    if (isEqual(pair[0], pairToMatch[0], meta) && isEqual(pair[1], pairToMatch[1], meta)) {
      return true;
    }
  }

  return false;
};

/**
 * @function hasValue
 *
 * @description
 * does the values include the vakye passed
 *
 * @param {Array<any>} values the values to check in
 * @param {any} item the value to locate
 * @param {function} isEqual the equality comparator
 * @param {any} meta the meta item to pass through
 * @returns {boolean} does the value exist in the values
 */
export const hasValue = (values, item, isEqual, meta) => {
  for (let index = 0; index < values.length; index++) {
    if (isEqual(values[index], item, meta)) {
      return true;
    }
  }

  return false;
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
 * @param {Map} map the map to convert to [key, value] pairs (entries)
 * @returns {Array<Array<*>>} the [key, value] pairs
 */
export const toPairs = (map) => {
  const pairs = [];

  map.forEach((value, key) => pairs.push([key, value]));

  return pairs;
};

/**
 * @function toValues
 *
 * @param {Set} set the set to convert to values
 * @returns {Array<*>} the values
 */
export const toValues = (set) => {
  const values = [];

  set.forEach((value) => values.push(value));

  return values;
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

/**
 * @function areMapsEqual
 *
 * @description
 * are the maps equal in value
 *
 * @param {Map} mapA the map to test
 * @param {Map} mapB the map to test against
 * @param {function} isEqual the comparator to determine equality
 * @param {any} meta the meta map to pass through
 * @returns {boolean} are the maps equal
 */
export const areMapsEqual = (mapA, mapB, isEqual, meta) => {
  if (mapA.size !== mapB.size) {
    return false;
  }

  const pairsA = toPairs(mapA);
  const pairsB = toPairs(mapB);

  for (let index = 0; index < pairsA.length; index++) {
    if (!hasPair(pairsB, pairsA[index], isEqual, meta) || !hasPair(pairsA, pairsB[index], isEqual, meta)) {
      return false;
    }
  }

  return true;
};

/**
 * @function areObjectsEqual
 *
 * @description
 * are the objects equal in value
 *
 * @param {Object} objectA the object to test
 * @param {Object} objectB the object to test against
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

    if (!hasValue(keysB, key, sameValueZeroEqual)) {
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

/**
 * @function areSetsEqual
 *
 * @description
 * are the sets equal in value
 *
 * @param {Set} setA the set to test
 * @param {Set} setB the set to test against
 * @param {function} isEqual the comparator to determine equality
 * @param {any} meta the meta set to pass through
 * @returns {boolean} are the sets equal
 */
export const areSetsEqual = (setA, setB, isEqual, meta) => {
  if (setA.size !== setB.size) {
    return false;
  }

  const valuesA = toValues(setA);
  const valuesB = toValues(setB);

  for (let index = 0; index < valuesA.length; index++) {
    if (!hasValue(valuesB, valuesA[index], isEqual, meta) || !hasValue(valuesA, valuesB[index], isEqual, meta)) {
      return false;
    }
  }

  return true;
};
