import { getStrictProperties, hasOwn, sameValueZeroEqual } from './utils';
import type { Dictionary, State } from './internalTypes';

const OWNER = '_owner';

const { getOwnPropertyDescriptor, keys } = Object;

/**
 * Whether the arrays are equal in value.
 */
export function areArraysEqual(a: any[], b: any[], state: State<any>) {
  let index = a.length;

  if (b.length !== index) {
    return false;
  }

  while (index-- > 0) {
    if (!state.equals(a[index], b[index], index, index, a, b, state)) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the dates passed are equal in value.
 */
export function areDatesEqual(a: Date, b: Date): boolean {
  return sameValueZeroEqual(a.getTime(), b.getTime());
}

/**
 * Whether the `Map`s are equal in value.
 */
export function areMapsEqual(
  a: Map<any, any>,
  b: Map<any, any>,
  state: State<any>,
): boolean {
  let isValueEqual = a.size === b.size;

  if (isValueEqual && a.size) {
    // The use of `forEach()` is to avoid the transpilation cost of `for...of` comparisons, and
    // the inability to control the performance of the resulting code. It also avoids excessive
    // iteration compared to doing comparisons of `keys()` and `values()`. As a result, though,
    // we cannot short-circuit the iterations; bookkeeping must be done to short-circuit the
    // equality checks themselves.

    const matchedIndices: Record<number, true> = {};

    let indexA = 0;

    a.forEach((aValue, aKey) => {
      if (!isValueEqual) {
        return;
      }

      let hasMatch = false;
      let matchIndexB = 0;

      b.forEach((bValue, bKey) => {
        if (
          !hasMatch &&
          !matchedIndices[matchIndexB] &&
          (hasMatch =
            state.equals(aKey, bKey, indexA, matchIndexB, a, b, state) &&
            state.equals(aValue, bValue, aKey, bKey, a, b, state))
        ) {
          matchedIndices[matchIndexB] = true;
        }

        matchIndexB++;
      });

      indexA++;
      isValueEqual = hasMatch;
    });
  }

  return isValueEqual;
}

/**
 * Whether the objects are equal in value.
 */
export function areObjectsEqual(
  a: Dictionary,
  b: Dictionary,
  state: State<any>,
): boolean {
  const properties = keys(a);

  let index = properties.length;

  if (keys(b).length !== index) {
    return false;
  }

  let property: string | symbol;

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > 0) {
    property = properties[index]!;

    if (
      property === OWNER &&
      (a.$$typeof || b.$$typeof) &&
      a.$$typeof !== b.$$typeof
    ) {
      return false;
    }

    if (
      !hasOwn(b, property) ||
      !state.equals(a[property], b[property], property, property, a, b, state)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the objects are equal in value with strict property checking.
 */
export function areObjectsEqualStrict(
  a: Dictionary,
  b: Dictionary,
  state: State<any>,
): boolean {
  const properties = getStrictProperties(a);

  let index = properties.length;

  if (getStrictProperties(b).length !== index) {
    return false;
  }

  let property: string | symbol;
  let descriptorA: ReturnType<typeof getOwnPropertyDescriptor>;
  let descriptorB: ReturnType<typeof getOwnPropertyDescriptor>;

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > 0) {
    property = properties[index]!;

    if (
      property === OWNER &&
      (a.$$typeof || b.$$typeof) &&
      a.$$typeof !== b.$$typeof
    ) {
      return false;
    }

    if (!hasOwn(b, property)) {
      return false;
    }

    if (
      !state.equals(a[property], b[property], property, property, a, b, state)
    ) {
      return false;
    }

    descriptorA = getOwnPropertyDescriptor(a, property);
    descriptorB = getOwnPropertyDescriptor(b, property);

    if (
      (descriptorA || descriptorB) &&
      (!descriptorA ||
        !descriptorB ||
        descriptorA.configurable !== descriptorB.configurable ||
        descriptorA.enumerable !== descriptorB.enumerable ||
        descriptorA.writable !== descriptorB.writable)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the primitive wrappers passed are equal in value.
 */
export function arePrimitiveWrappersEqual(a: Date, b: Date): boolean {
  return sameValueZeroEqual(a.valueOf(), b.valueOf());
}

/**
 * Whether the regexps passed are equal in value.
 */
export function areRegExpsEqual(a: RegExp, b: RegExp): boolean {
  return a.source === b.source && a.flags === b.flags;
}

/**
 * Whether the `Set`s are equal in value.
 */
export function areSetsEqual(
  a: Set<any>,
  b: Set<any>,
  state: State<any>,
): boolean {
  let isValueEqual = a.size === b.size;

  if (isValueEqual && a.size) {
    // The use of `forEach()` is to avoid the transpilation cost of `for...of` comparisons, and
    // the inability to control the performance of the resulting code. It also avoids excessive
    // iteration compared to doing comparisons of `keys()` and `values()`. As a result, though,
    // we cannot short-circuit the iterations; bookkeeping must be done to short-circuit the
    // equality checks themselves.

    const matchedIndices: Record<number, true> = {};

    a.forEach((aValue, aKey) => {
      if (!isValueEqual) {
        return;
      }

      let hasMatch = false;
      let matchIndex = 0;

      b.forEach((bValue, bKey) => {
        if (
          !hasMatch &&
          !matchedIndices[matchIndex] &&
          (hasMatch = state.equals(aValue, bValue, aKey, bKey, a, b, state))
        ) {
          matchedIndices[matchIndex] = true;
        }

        matchIndex++;
      });

      isValueEqual = hasMatch;
    });
  }

  return isValueEqual;
}
