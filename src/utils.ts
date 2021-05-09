const HAS_WEAKSET_SUPPORT = typeof WeakSet === 'function';

const { keys } = Object;

type Cache = {
  add: (value: any) => void;
  has: (value: any) => boolean;
};

export type EqualityComparator = (a: any, b: any, meta?: any) => boolean;

/**
 * @function hasPair
 *
 * @description
 * does the `pairToMatch` exist in the list of `pairs` provided based on the
 * `isEqual` check
 *
 * @param pairs the pairs to compare against
 * @param pairToMatch the pair to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the pair exist in the pairs provided
 */
export function hasPair(
  pairs: [any, any][],
  pairToMatch: [any, any],
  isEqual: EqualityComparator,
  meta: any,
) {
  let index = pairs.length;
  let pair: [any, any];

  while (index-- > 0) {
    pair = pairs[index];

    if (
      isEqual(pair[0], pairToMatch[0], meta) &&
      isEqual(pair[1], pairToMatch[1], meta)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * @function hasValue
 *
 * @description
 * does the `valueToMatch` exist in the list of `values` provided based on the
 * `isEqual` check
 *
 * @param values the values to compare against
 * @param valueToMatch the value to match
 * @param isEqual the equality comparator used
 * @param meta the meta provided
 * @returns does the value exist in the values provided
 */
export function hasValue(
  values: any[],
  valueToMatch: any,
  isEqual: EqualityComparator,
  meta: any,
) {
  let index = values.length;

  while (index-- > 0) {
    if (isEqual(values[index], valueToMatch, meta)) {
      return true;
    }
  }

  return false;
}

/**
 * @function sameValueZeroEqual
 *
 * @description
 * are the values passed strictly equal or both NaN
 *
 * @param a the value to compare against
 * @param b the value to test
 * @returns are the values equal by the SameValueZero principle
 */
export function sameValueZeroEqual(a: any, b: any) {
  return a === b || (a !== a && b !== b);
}

/**
 * @function isPlainObject
 *
 * @description
 * is the value a plain object
 *
 * @param value the value to test
 * @returns is the value a plain object
 */
export function isPlainObject(value: any) {
  return value.constructor === Object || value.constructor == null;
}

/**
 * @function isPromiseLike
 *
 * @description
 * is the value promise-like (meaning it is thenable)
 *
 * @param value the value to test
 * @returns is the value promise-like
 */
export function isPromiseLike(value: any) {
  return !!value && typeof value.then === 'function';
}

/**
 * @function isReactElement
 *
 * @description
 * is the value passed a react element
 *
 * @param value the value to test
 * @returns is the value a react element
 */
export function isReactElement(value: any) {
  return !!(value && value.$$typeof);
}

/**
 * @function getNewCacheFallback
 *
 * @description
 * in cases where WeakSet is not supported, creates a new custom
 * object that mimics the necessary API aspects for cache purposes
 *
 * @returns the new cache object
 */
export function getNewCacheFallback(): Cache {
  return Object.create({
    _values: [],

    add(value: any) {
      this._values.push(value);
    },

    has(value: any) {
      return this._values.indexOf(value) !== -1;
    },
  });
}

/**
 * @function getNewCache
 *
 * @description
 * get a new cache object to prevent circular references
 *
 * @returns the new cache object
 */
export const getNewCache = ((canUseWeakMap: boolean) => {
  if (canUseWeakMap) {
    return function _getNewCache(): Cache {
      return new WeakSet();
    };
  }

  return getNewCacheFallback;
})(HAS_WEAKSET_SUPPORT);

/**
 * @function createCircularEqualCreator
 *
 * @description
 * create a custom isEqual handler specific to circular objects
 *
 * @param [isEqual] the isEqual comparator to use instead of isDeepEqual
 * @returns the method to create the `isEqual` function
 */
export function createCircularEqualCreator(isEqual?: EqualityComparator) {
  return function createCircularEqual(comparator: EqualityComparator) {
    const _comparator = isEqual || comparator;

    return function circularEqual(
      a: any,
      b: any,
      cache: Cache = getNewCache(),
    ) {
      const isCacheableA = !!a && typeof a === 'object';
      const isCacheableB = !!b && typeof b === 'object';

      if (isCacheableA || isCacheableB) {
        const hasA = isCacheableA && cache.has(a);
        const hasB = isCacheableB && cache.has(b);

        if (hasA || hasB) {
          return hasA && hasB;
        }

        if (isCacheableA) {
          cache.add(a);
        }

        if (isCacheableA) {
          cache.add(b);
        }
      }

      return _comparator(a, b, cache);
    };
  };
}

/**
 * @function toPairs
 *
 * @description
 * convert the map passed into pairs (meaning an array of [key, value] tuples)
 *
 * @param map the map to convert to [key, value] pairs (entries)
 * @returns the [key, value] pairs
 */
export function toPairs(map: Map<any, any>): [any, any][] {
  const pairs = new Array(map.size);

  let index = 0;

  map.forEach((value, key) => {
    pairs[index++] = [key, value];
  });

  return pairs;
}

/**
 * @function toValues
 *
 * @description
 * convert the set passed into values
 *
 * @param set the set to convert to values
 * @returns the values
 */
export function toValues(set: Set<any>) {
  const values = new Array(set.size);

  let index = 0;

  set.forEach((value) => {
    values[index++] = value;
  });

  return values;
}

/**
 * @function areArraysEqual
 *
 * @description
 * are the arrays equal in value
 *
 * @param a the array to test
 * @param b the array to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the arrays equal
 */
export function areArraysEqual(
  a: any[],
  b: any[],
  isEqual: EqualityComparator,
  meta: any,
) {
  let index = a.length;

  if (b.length !== index) {
    return false;
  }

  while (index-- > 0) {
    if (!isEqual(a[index], b[index], meta)) {
      return false;
    }
  }

  return true;
}

/**
 * @function areMapsEqual
 *
 * @description
 * are the maps equal in value
 *
 * @param a the map to test
 * @param b the map to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta map to pass through
 * @returns are the maps equal
 */
export function areMapsEqual(
  a: Map<any, any>,
  b: Map<any, any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  let index = a.size;

  if (b.size !== index) {
    return false;
  }

  if (index) {
    const pairsA = toPairs(a);
    const pairsB = toPairs(b);

    while (index-- > 0) {
      if (
        !hasPair(pairsB, pairsA[index], isEqual, meta) ||
        !hasPair(pairsA, pairsB[index], isEqual, meta)
      ) {
        return false;
      }
    }
  }

  return true;
}

type Dictionary<Type> = {
  [key: string]: Type;
  [index: number]: Type;
};

const OWNER = '_owner';

const hasOwnProperty = Function.prototype.bind.call(
  Function.prototype.call,
  Object.prototype.hasOwnProperty,
);

/**
 * @function areObjectsEqual
 *
 * @description
 * are the objects equal in value
 *
 * @param a the object to test
 * @param b the object to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the objects equal
 */
export function areObjectsEqual(
  a: Dictionary<any>,
  b: Dictionary<any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  const keysA = keys(a);

  let index = keysA.length;

  if (keys(b).length !== index) {
    return false;
  }

  if (index) {
    let key: string;

    while (index-- > 0) {
      key = keysA[index];

      if (key === OWNER) {
        const reactElementA = isReactElement(a);
        const reactElementB = isReactElement(b);

        if (
          (reactElementA || reactElementB) &&
          reactElementA !== reactElementB
        ) {
          return false;
        }
      }

      if (!hasOwnProperty(b, key) || !isEqual(a[key], b[key], meta)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * @function areRegExpsEqual
 *
 * @description
 * are the regExps equal in value
 *
 * @param a the regExp to test
 * @param b the regExp to test agains
 * @returns are the regExps equal
 */
export function areRegExpsEqual(a: RegExp, b: RegExp) {
  return (
    a.source === b.source &&
    a.global === b.global &&
    a.ignoreCase === b.ignoreCase &&
    a.multiline === b.multiline &&
    a.unicode === b.unicode &&
    a.sticky === b.sticky &&
    a.lastIndex === b.lastIndex
  );
}

/**
 * @function areSetsEqual
 *
 * @description
 * are the sets equal in value
 *
 * @param a the set to test
 * @param b the set to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta set to pass through
 * @returns are the sets equal
 */
export function areSetsEqual(
  a: Set<any>,
  b: Set<any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  let index = a.size;

  if (b.size !== index) {
    return false;
  }

  if (index) {
    const valuesA = toValues(a);
    const valuesB = toValues(b);

    while (index-- > 0) {
      if (
        !hasValue(valuesB, valuesA[index], isEqual, meta) ||
        !hasValue(valuesA, valuesB[index], isEqual, meta)
      ) {
        return false;
      }
    }
  }

  return true;
}
