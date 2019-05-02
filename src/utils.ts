const HAS_WEAKSET_SUPPORT = typeof WeakSet === 'function';

const { keys } = Object;

type Cache = {
  add: (value: any) => void;
  has: (value: any) => boolean;
};

export function addToCache(value: any, cache: Cache) {
  if (value && typeof value === 'object') {
    cache.add(value);
  }
}

export type EqualityComparator = (a: any, b: any, meta?: any) => boolean;

export function hasPair(
  pairs: any[][],
  pairToMatch: any[],
  isEqual: EqualityComparator,
  meta: any,
) {
  const { length } = pairs;

  let pair: any;

  for (let index = 0; index < length; index++) {
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

export function hasValue(
  values: any[],
  item: any,
  isEqual: EqualityComparator,
  meta: any,
) {
  const { length } = values;

  for (let index = 0; index < length; index++) {
    if (isEqual(values[index], item, meta)) {
      return true;
    }
  }

  return false;
}

export function sameValueZeroEqual(a: any, b: any) {
  return a === b || (a !== a && b !== b);
}

export function isPlainObject(value: any) {
  return value.constructor === Object || value.constructor == null;
}

export function isPromiseLike(value: any) {
  return !!value && typeof value.then === 'function';
}

export function isReactElement(value: any) {
  return !!(value && value.$$typeof);
}

export function getNewCacheFallback(): Cache {
  return Object.create({
    _values: [],

    add(value: any) {
      this._values.push(value);
    },

    has(value: any) {
      // eslint-disable-next-line no-bitwise
      return !!~this._values.indexOf(value);
    },
  });
}

export const getNewCache = ((canUseWeakMap: boolean) => {
  if (canUseWeakMap) {
    return function _getNewCache(): Cache {
      return new WeakSet();
    };
  }

  return getNewCacheFallback;
})(HAS_WEAKSET_SUPPORT);

export function createCircularIsEqualCreator(isEqual?: EqualityComparator) {
  return function createCircularIsEqual(comparator: EqualityComparator) {
    const _comparator = isEqual || comparator;

    return function circularIsEqual(
      a: any,
      b: any,
      cache: Cache = getNewCache(),
    ) {
      const hasA = cache.has(a);
      const hasB = cache.has(b);

      if (hasA || hasB) {
        return hasA && hasB;
      }

      addToCache(a, cache);
      addToCache(b, cache);

      return _comparator(a, b, cache);
    };
  };
}

export function toPairs(map: Map<any, any>) {
  const pairs = new Array(map.size);

  let index = 0;

  map.forEach((value, key) => {
    pairs[index++] = [key, value];
  });

  return pairs;
}

export function toValues(set: Set<any>) {
  const values = new Array(set.size);

  let index = 0;

  set.forEach((value) => {
    values[index++] = value;
  });

  return values;
}

export function areArraysEqual(
  a: any[],
  b: any[],
  isEqual: EqualityComparator,
  meta: any,
) {
  const { length } = a;

  if (b.length !== length) {
    return false;
  }

  for (let index = 0; index < length; index++) {
    if (!isEqual(a[index], b[index], meta)) {
      return false;
    }
  }

  return true;
}

export function areMapsEqual(
  a: Map<any, any>,
  b: Map<any, any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  if (a.size !== b.size) {
    return false;
  }

  const pairsA = toPairs(a);
  const pairsB = toPairs(b);

  const { length } = pairsA;

  for (let index = 0; index < length; index++) {
    if (
      !hasPair(pairsB, pairsA[index], isEqual, meta) ||
      !hasPair(pairsA, pairsB[index], isEqual, meta)
    ) {
      return false;
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

export function areObjectsEqual(
  a: Dictionary<any>,
  b: Dictionary<any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  const keysA = keys(a);

  const { length } = keysA;

  if (keys(b).length !== length) {
    return false;
  }

  let key: any;

  for (let index = 0; index < length; index++) {
    key = keysA[index];

    if (!hasOwnProperty(b, key)) {
      return false;
    }

    if (key === OWNER && isReactElement(a)) {
      if (!isReactElement(b)) {
        return false;
      }

      // eslint-disable-next-line no-continue
      continue;
    }

    if (!isEqual(a[key], b[key], meta)) {
      return false;
    }
  }

  return true;
}

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

export function areSetsEqual(
  a: Set<any>,
  b: Set<any>,
  isEqual: EqualityComparator,
  meta: any,
) {
  if (a.size !== b.size) {
    return false;
  }

  const valuesA = toValues(a);
  const valuesB = toValues(b);

  const { length } = valuesA;

  for (let index = 0; index < length; index++) {
    if (
      !hasValue(valuesB, valuesA[index], isEqual, meta) ||
      !hasValue(valuesA, valuesB[index], isEqual, meta)
    ) {
      return false;
    }
  }

  return true;
}
