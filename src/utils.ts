import type { Cache } from "./cache";

export type InternalEqualityComparator = (
  objectA: any,
  objectB: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  meta: any
) => boolean;

export type EqualityComparator = <A, B, Meta>(
  objectA: A,
  objectB: B,
  meta?: Meta
) => boolean;

export type NativeEqualityComparator = <A, B>(
  objectA: A,
  objectB: B
) => boolean;

const { valueOf } = Object.prototype;

export function createIsCircular<
  AreItemsEqual extends (...args: any) => boolean
>(areItemsEqual: AreItemsEqual) {
  return function isCircular(
    a: any,
    b: any,
    isEqual: InternalEqualityComparator,
    cache: Cache
  ) {
    if (!a || !b || typeof a !== "object" || typeof b !== "object") {
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
 * is the value a plain object
 *
 * @param value the value to test
 * @returns is the value a plain object
 */
export function isPlainObject(value: any) {
  return value.constructor === Object || value.constructor == null;
}

export function isPrimitiveWrapper(
  value: any
): value is Boolean | BigInt | Number | String | Symbol {
  return value.valueOf !== valueOf;
}

/**
 * is the value promise-like (meaning it is thenable)
 *
 * @param value the value to test
 * @returns is the value promise-like
 */
export function isPromiseLike(value: any) {
  return typeof value.then === "function";
}

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
