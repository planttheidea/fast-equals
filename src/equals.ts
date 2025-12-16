import type { Dictionary, PrimitiveWrapper, State, TypedArray } from './internalTypes.js';
import { getStrictProperties, hasOwn } from './utils.js';

const PREACT_VNODE = '__v';
const PREACT_OWNER = '__o';
const REACT_OWNER = '_owner';

const { getOwnPropertyDescriptor, keys } = Object;

/**
 * Whether the values passed are equal based on a [SameValue](https://262.ecma-international.org/7.0/#sec-samevalue) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`) or both are `NaN`.
 *
 * @note
 * When available in the environment, this is just a re-export of the global
 * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) method.
 */
export const sameValueEqual =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.is
  || function sameValueEqual(a: any, b: any): boolean {
    return a === b ? a !== 0 || 1 / a === 1 / b : a !== a && b !== b;
  };

/**
 * Whether the values passed are equal based on a [SameValue](https://262.ecma-international.org/7.0/#sec-samevaluezero) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`), both are `NaN`, or both
 * are either positive or negative zero.
 */
export function sameValueZeroEqual(a: any, b: any): boolean {
  return a === b || (a !== a && b !== b);
}

/**
 * Whether the array buffers are equal in value.
 */
export function areArrayBuffersEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  return a.byteLength === b.byteLength && areTypedArraysEqual(new Uint8Array(a), new Uint8Array(b));
}

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
 * Whether the dataviews are equal in value.
 */
export function areDataViewsEqual(a: DataView, b: DataView): boolean {
  return (
    a.byteLength === b.byteLength
    && areTypedArraysEqual(
      new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
      new Uint8Array(b.buffer, b.byteOffset, b.byteLength),
    )
  );
}

/**
 * Whether the dates passed are equal in value.
 */
export function areDatesEqual(a: Date, b: Date): boolean {
  return sameValueEqual(a.getTime(), b.getTime());
}

/**
 * Whether the errors passed are equal in value.
 */
export function areErrorsEqual(a: Error, b: Error): boolean {
  return a.name === b.name && a.message === b.message && a.cause === b.cause && a.stack === b.stack;
}

/**
 * Whether the functions passed are equal in value.
 */
export function areFunctionsEqual(a: (...args: any[]) => any, b: (...args: any[]) => any): boolean {
  return a === b;
}

/**
 * Whether the generator objects passed are equal in value.
 */
export function areGeneratorsEqual(a: AsyncGenerator | Generator, b: AsyncGenerator | Generator): boolean {
  return a === b;
}

/**
 * Whether the `Map`s are equal in value.
 */
export function areMapsEqual(a: Map<any, any>, b: Map<any, any>, state: State<any>): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  const matchedIndices = new Array<true | undefined>(size);
  const aIterable = a.entries();

  let aResult: IteratorResult<[any, any]>;
  let bResult: IteratorResult<[any, any]>;
  let index = 0;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while ((aResult = aIterable.next())) {
    if (aResult.done) {
      break;
    }

    const bIterable = b.entries();

    let hasMatch = false;
    let matchIndex = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while ((bResult = bIterable.next())) {
      if (bResult.done) {
        break;
      }

      if (matchedIndices[matchIndex]) {
        matchIndex++;
        continue;
      }

      const aEntry = aResult.value;
      const bEntry = bResult.value;

      if (
        state.equals(aEntry[0], bEntry[0], index, matchIndex, a, b, state)
        && state.equals(aEntry[1], bEntry[1], aEntry[0], bEntry[0], a, b, state)
      ) {
        hasMatch = matchedIndices[matchIndex] = true;
        break;
      }

      matchIndex++;
    }

    if (!hasMatch) {
      return false;
    }

    index++;
  }

  return true;
}

/**
 * Whether the numbers are equal in value.
 */
export const areNumbersEqual = sameValueEqual;

/**
 * Whether the objects are equal in value.
 */
export function areObjectsEqual(a: Dictionary, b: Dictionary, state: State<any>): boolean {
  const properties = keys(a);

  let index = properties.length;

  if (keys(b).length !== index) {
    return false;
  }

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > 0) {
    if (!isPropertyEqual(a, b, state, properties[index]!)) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the objects are equal in value with strict property checking.
 */
export function areObjectsEqualStrict(a: Dictionary, b: Dictionary, state: State<any>): boolean {
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

    if (!isPropertyEqual(a, b, state, property)) {
      return false;
    }

    descriptorA = getOwnPropertyDescriptor(a, property);
    descriptorB = getOwnPropertyDescriptor(b, property);

    if (
      (descriptorA || descriptorB)
      && (!descriptorA
        || !descriptorB
        || descriptorA.configurable !== descriptorB.configurable
        || descriptorA.enumerable !== descriptorB.enumerable
        || descriptorA.writable !== descriptorB.writable)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the primitive wrappers passed are equal in value.
 */
export function arePrimitiveWrappersEqual(a: PrimitiveWrapper, b: PrimitiveWrapper): boolean {
  return sameValueEqual(a.valueOf(), b.valueOf());
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
export function areSetsEqual(a: Set<any>, b: Set<any>, state: State<any>): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  const matchedIndices = new Array<true | undefined>(size);
  const aIterable = a.values();

  let aResult: IteratorResult<any>;
  let bResult: IteratorResult<any>;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while ((aResult = aIterable.next())) {
    if (aResult.done) {
      break;
    }

    const bIterable = b.values();

    let hasMatch = false;
    let matchIndex = 0;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    while ((bResult = bIterable.next())) {
      if (bResult.done) {
        break;
      }

      if (
        !matchedIndices[matchIndex]
        && state.equals(aResult.value, bResult.value, aResult.value, bResult.value, a, b, state)
      ) {
        hasMatch = matchedIndices[matchIndex] = true;
        break;
      }

      matchIndex++;
    }

    if (!hasMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the TypedArray instances are equal in value.
 */
export function areTypedArraysEqual(a: TypedArray, b: TypedArray) {
  let index = a.byteLength;

  if (b.byteLength !== index || a.byteOffset !== b.byteOffset) {
    return false;
  }

  while (index-- > 0) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the URL instances are equal in value.
 */
export function areUrlsEqual(a: URL, b: URL): boolean {
  return (
    a.hostname === b.hostname
    && a.pathname === b.pathname
    && a.protocol === b.protocol
    && a.port === b.port
    && a.hash === b.hash
    && a.username === b.username
    && a.password === b.password
  );
}

function isPropertyEqual(a: Dictionary, b: Dictionary, state: State<any>, property: string | symbol) {
  if (
    (property === REACT_OWNER || property === PREACT_OWNER || property === PREACT_VNODE)
    && (a.$$typeof || b.$$typeof)
  ) {
    return true;
  }

  return hasOwn(b, property) && state.equals(a[property], b[property], property, property, a, b, state);
}
