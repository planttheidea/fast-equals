import type { AnyObject, PrimitiveWrapper, State, TypedArray } from './internalTypes.js';
import {
  areStrictPropertiesEqual,
  getStrictProperties,
  getTypedArrayTag,
  isReactProperty,
  sortSearchParams,
} from './utils.js';

/**
 * Above this many keys, out-of-position keys are checked with `propertyIsEnumerable` rather than by
 * scanning the other object's keys. Measured in V8: scanning wins up to 50 keys and loses from 100.
 */
const MAX_SCANNED_PROPERTIES = 64;

const { keys } = Object;
const { propertyIsEnumerable } = Object.prototype;

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
 * Whether the values passed are equal based on a
 * [Strict Equality Comparison](https://262.ecma-international.org/7.0/#sec-strict-equality-comparison) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`).
 *
 * @note
 * This is mainly available as a convenience function, such as being a default when a function to determine equality between
 * two objects is used.
 */
export function strictEqual(a: any, b: any): boolean {
  return a === b;
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
 *
 * @note
 * `name`, `message` and `stack` are own properties but are not enumerable, so they are compared
 * explicitly. `cause` and `errors` are compared by value rather than by reference, matching how
 * every other nested value in the comparison is treated. They are compared exactly once, regardless
 * of whether they were assigned (enumerable) or set by the constructor (non-enumerable). Other own
 * enumerable properties (which custom `Error` subclasses commonly add) are compared afterward.
 *
 * The own property comparison is inlined rather than extracted, which measured faster in V8 when
 * recursing through `cause`. Keep the bytecode under V8's 460-byte TurboFan inlining limit (383 bytes
 * at time of writing; check with `node --print-bytecode --print-bytecode-filter=areErrorsEqual`), or
 * this stops being inlined into its callers.
 */
export function areErrorsEqual(a: Error, b: Error, state: State<any>): boolean {
  if (a.name !== b.name || a.message !== b.message || a.stack !== b.stack) {
    return false;
  }

  const causeA = a.cause;
  const causeB = b.cause;

  if (causeA !== causeB && !state.equals(causeA, causeB, 'cause', 'cause', a, b, state)) {
    return false;
  }

  const errorsA = (a as AggregateError).errors;
  const errorsB = (b as AggregateError).errors;

  if (errorsA !== errorsB && !state.equals(errorsA, errorsB, 'errors', 'errors', a, b, state)) {
    return false;
  }

  const propertiesA = keys(a);
  const propertiesB = keys(b);

  let index = propertiesA.length;

  // Constructed errors rarely have enumerable own properties.
  if (!index && !propertiesB.length) {
    return true;
  }

  let compared = 0;
  let property: string;

  while (index-- > 0) {
    property = propertiesA[index]!;

    // Already compared above regardless of enumerability, so we can ignore them.
    if (property === 'cause' || property === 'errors') {
      continue;
    }

    // `propertyIsEnumerable` rather than `hasOwn`, so that a non-enumerable own property on `b` cannot
    // stand in for an enumerable one. Keys in the same position are trivially enumerable on `b`.
    if (
      (property !== propertiesB[index] && !propertyIsEnumerable.call(b, property))
      || !state.equals((a as AnyObject)[property], (b as AnyObject)[property], property, property, a, b, state)
    ) {
      return false;
    }

    ++compared;
  }

  // Every compared key is enumerable on `b`, so any of `b`'s keys left over must be `cause` / `errors`.
  const remaining = propertiesB.length - compared;

  return (
    !remaining
    || remaining === (propertyIsEnumerable.call(b, 'cause') ? 1 : 0) + (propertyIsEnumerable.call(b, 'errors') ? 1 : 0)
  );
}

/**
 * Whether the errors passed are equal in value.
 *
 * @note
 * `name`, `message` and `stack` are own properties but are not enumerable, so they are compared
 * explicitly. `cause` and `errors` are own properties, so `areObjectsEqualStrict` compares them along
 * with every other own property; they are not compared explicitly to avoid comparing them twice.
 */
export function areErrorsEqualStrict(a: Error, b: Error, state: State<any>): boolean {
  return a.name === b.name && a.message === b.message && a.stack === b.stack && areObjectsEqualStrict(a, b, state);
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
 * Whether the objects are equal in value.
 */
export function areObjectsEqual(a: AnyObject, b: AnyObject, state: State<any>): boolean {
  const properties = keys(a);
  const propertiesB = keys(b);

  let index = properties.length;

  if (propertiesB.length !== index) {
    return false;
  }

  const isScannable = index <= MAX_SCANNED_PROPERTIES;

  let property: string;

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > 0) {
    property = properties[index]!;

    if (isReactProperty(a, b, property)) {
      continue;
    }

    // Objects built the same way list their keys in the same order, in which case the key is
    // already known to be an own enumerable property of `b` and the lookup can be skipped.
    // Otherwise, `propertiesB` is exactly `b`'s own enumerable keys. Scanning it is faster than
    // `propertyIsEnumerable` for smaller objects, but it is linear per key, so larger objects
    // (where reordering would make it quadratic) use the lookup instead.
    if (
      (property !== propertiesB[index]
        && !(isScannable ? propertiesB.includes(property) : propertyIsEnumerable.call(b, property)))
      || !state.equals(a[property], b[property], property, property, a, b, state)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the objects are equal in value with strict property checking.
 */
export function areObjectsEqualStrict(a: AnyObject, b: AnyObject, state: State<any>): boolean {
  const properties = getStrictProperties(a);

  return getStrictProperties(b).length === properties.length && areStrictPropertiesEqual(a, b, state, properties, 0);
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
 * Whether the search params passed are equal in value.
 *
 * @note
 * Order is not significant, matching how the other unordered collections in the library are
 * compared. Repeated keys are, so this is a comparison of multisets rather than of sets:
 * `a=1&a=2` is equal to `a=2&a=1`, but not to `a=1&a=1`.
 */
function areSearchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  const serializedA = a.toString();
  const serializedB = b.toString();

  // Identical serializations are equal under any ordering, and this is by far the common case, so
  // it is worth checking before sorting anything.
  return serializedA === serializedB || sortSearchParams(serializedA) === sortSearchParams(serializedB);
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
  let index = a.length;

  if (b.length !== index || a.byteOffset !== b.byteOffset) {
    return false;
  }

  // Only float-backed views can hold `NaN`, and the additional check needed to treat it as equal
  // to itself measurably slows the loop, so integer views keep the plain comparison. This is
  // hoisted out of the loop so the cost is paid once per call rather than once per element.
  const tag = getTypedArrayTag.call(a);

  if (tag === 'Float64Array' || tag === 'Float32Array' || tag === 'Float16Array') {
    while (index-- > 0) {
      // `NaN` is the only value not equal to itself, and it is treated as equal here to match
      // the SameValueZero semantics used for every other numeric comparison in the library.
      if (a[index] !== b[index] && (a[index] === a[index] || b[index] === b[index])) {
        return false;
      }
    }

    return true;
  }

  while (index-- > 0) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the TypedArray instances are equal in value with strict property checking.
 *
 * @note
 * Indexed elements are also own properties, listed first and in order, with descriptors fixed by the
 * spec. They are compared once by `areTypedArraysEqual`, so only the own properties after them
 * (including symbols) are compared with strict property checking.
 */
export function areTypedArraysEqualStrict(a: TypedArray, b: TypedArray, state: State<any>): boolean {
  if (!areTypedArraysEqual(a, b)) {
    return false;
  }

  const properties = getStrictProperties(a);

  return (
    getStrictProperties(b).length === properties.length && areStrictPropertiesEqual(a, b, state, properties, a.length)
  );
}

/**
 * Whether the URL instances are equal in value.
 */
export function areUrlsEqual(a: URL, b: URL): boolean {
  // `href` is the normalized serialization of every component, so matching hrefs are equal without
  // any further work. Only a difference in query parameter ordering can survive a mismatch here.
  if (a.href === b.href) {
    return true;
  }

  return (
    a.protocol === b.protocol
    && a.username === b.username
    && a.password === b.password
    // `host` covers both the hostname and the port.
    && a.host === b.host
    && a.pathname === b.pathname
    && a.hash === b.hash
    && areSearchParamsEqual(a.searchParams, b.searchParams)
  );
}
