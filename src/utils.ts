import {
  Cache,
  CircularCache,
  Dictionary,
  EqualityComparator,
  InternalEqualityComparator,
  TypeEqualityComparator,
} from './internalTypes';

const { getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { hasOwnProperty } = Object.prototype;

export function createDefaultComparator(compare: EqualityComparator) {
  return function (
    a: any,
    b: any,
    _indexOrKeyA: any,
    _indexOrKeyB: any,
    _parentA: any,
    _parentB: any,
    cache: Cache,
  ) {
    return compare(a, b, cache);
  };
}

/**
 * Default equality comparator pass-through, used as the standard `isEqual` creator for
 * use inside the built comparator.
 */
export function createDefaultIsNestedEqual(
  comparator: EqualityComparator,
): InternalEqualityComparator {
  return function isEqual<A, B>(
    a: A,
    b: B,
    _indexOrKeyA: any,
    _indexOrKeyB: any,
    _parentA: any,
    _parentB: any,
    cache: Cache,
  ) {
    return comparator(a, b, cache);
  };
}

/**
 * Wrap the provided `areItemsEqual` method to manage the circular cache, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
export function createIsCircular<
  AreItemsEqual extends TypeEqualityComparator<any>,
>(areItemsEqual: AreItemsEqual): AreItemsEqual {
  return function isCircular(a: any, b: any, cache: CircularCache) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return areItemsEqual(a, b, cache);
    }

    const cachedA = cache.__c.get(a);
    const cachedB = cache.__c.get(b);

    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }

    cache.__c.set(a, b);
    cache.__c.set(b, a);

    const result = areItemsEqual(a, b, cache);

    cache.__c.delete(a);
    cache.__c.delete(b);

    return result;
  } as AreItemsEqual;
}

export function getStrictProperties(
  object: Dictionary,
): Array<string | symbol> {
  return (getOwnPropertyNames(object) as Array<string | symbol>).concat(
    getOwnPropertySymbols(object),
  );
}

export const hasOwn =
  Object.hasOwn ||
  ((object: Dictionary, property: number | string | symbol) =>
    hasOwnProperty.call(object, property));

/**
 * Whether the value is a plain object.
 *
 * @NOTE
 * This is a same-realm compariosn only.
 */
export function isPlainObject(value: any): boolean {
  return value.constructor === Object || value.constructor == null;
}

/**
 * When the value is `Promise`-like, aka "then-able".
 */
export function isPromiseLike(value: any): boolean {
  return typeof value.then === 'function';
}

/**
 * Whether the values passed are strictly equal or both NaN.
 */
export function sameValueZeroEqual(a: any, b: any): boolean {
  return a === b || (a !== a && b !== b);
}
