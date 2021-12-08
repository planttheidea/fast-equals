const HAS_WEAKSET_SUPPORT = typeof WeakSet === 'function';

const { keys } = Object;

type Cache = {
  add: (value: any) => void;
  has: (value: any) => boolean;
};

export type EqualityComparator = (a: any, b: any, meta?: any) => boolean;

/**
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
 * is the value a plain object
 *
 * @param value the value to test
 * @returns is the value a plain object
 */
export function isPlainObject(value: any) {
  return value.constructor === Object || value.constructor == null;
}

/**
 * is the value promise-like (meaning it is thenable)
 *
 * @param value the value to test
 * @returns is the value promise-like
 */
export function isPromiseLike(value: any) {
  return !!value && typeof value.then === 'function';
}

/**
 * is the value passed a react element
 *
 * @param value the value to test
 * @returns is the value a react element
 */
export function isReactElement(value: any) {
  return !!(value && value.$$typeof);
}

/**
 * in cases where WeakSet is not supported, creates a new custom
 * object that mimics the necessary API aspects for cache purposes
 *
 * @returns the new cache object
 */
export function getNewCacheFallback(): Cache {
  const values: any[] = [];

  return {
    add(value: any) {
      values.push(value);
    },

    has(value: any) {
      return values.indexOf(value) !== -1;
    },
  };
}

/**
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

        if (isCacheableB) {
          cache.add(b);
        }
      }

      return _comparator(a, b, cache);
    };
  };
}

/**
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
  let isValueEqual = a.size === b.size;

  if (isValueEqual && a.size) {
    const matchedIndices: Record<number, true> = {};

    a.forEach((aValue, aKey) => {
      if (isValueEqual) {
        let hasMatch = false;
        let matchIndex = 0;

        b.forEach((bValue, bKey) => {
          if (!hasMatch && !matchedIndices[matchIndex]) {
            hasMatch =
              isEqual(aKey, bKey, meta) && isEqual(aValue, bValue, meta);

            if (hasMatch) {
              matchedIndices[matchIndex] = true;
            }
          }

          matchIndex++;
        });

        isValueEqual = hasMatch;
      }
    });
  }

  return isValueEqual;
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
  let isValueEqual = a.size === b.size;

  if (isValueEqual && a.size) {
    const matchedIndices: Record<number, true> = {};

    a.forEach((aValue) => {
      if (isValueEqual) {
        let hasMatch = false;
        let matchIndex = 0;

        b.forEach((bValue) => {
          if (!hasMatch && !matchedIndices[matchIndex]) {
            hasMatch = isEqual(aValue, bValue, meta);

            if (hasMatch) {
              matchedIndices[matchIndex] = true;
            }
          }

          matchIndex++;
        });

        isValueEqual = hasMatch;
      }
    });
  }

  return isValueEqual;
}
