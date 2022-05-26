export type InternalEqualityComparator = (
  objectA: any,
  objectB: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  meta: any,
) => boolean;

export type EqualityComparator = <A, B, Meta>(
  objectA: A,
  objectB: B,
  meta?: Meta,
) => boolean;

export type EqualityComparatorCreator = (
  fn: EqualityComparator,
) => InternalEqualityComparator;

export type NativeEqualityComparator = <A, B>(
  objectA: A,
  objectB: B,
) => boolean;

/**
 * Wrap the provided `areItemsEqual` method to manage the circular cache, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
export function createIsCircular<
  AreItemsEqual extends (...args: any) => boolean,
>(areItemsEqual: AreItemsEqual) {
  return function isCircular(
    a: any,
    b: any,
    isEqual: InternalEqualityComparator,
    cache: WeakMap<any, any>,
  ) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return areItemsEqual(a, b, isEqual, cache);
    }

    const cachedA = cache.get(a);
    const cachedB = cache.get(b);

    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }

    cache.set(a, b);
    cache.set(b, a);

    const result = areItemsEqual(a, b, isEqual, cache);

    cache.delete(a);
    cache.delete(b);

    return result;
  } as AreItemsEqual;
}

/**
 * Whether the value is a plain object.
 *
 * @NOTE
 * This is a same-realm compariosn only.
 */
export function isPlainObject(value: any) {
  return value.constructor === Object || value.constructor == null;
}

/**
 * When the value is `Promise`-like, aka "then-able".
 */
export function isPromiseLike(value: any) {
  return typeof value.then === 'function';
}

/**
 * Whether the values passed are strictly equal or both NaN.
 */
export function sameValueZeroEqual(a: any, b: any) {
  return a === b || (a !== a && b !== b);
}
