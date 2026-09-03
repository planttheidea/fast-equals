import type { AnyObject, PrimitiveWrapper, State, TypedArray } from './internalTypes.js';
import { getStrictProperties, hasOwn } from './utils.js';

const PREACT_VNODE = '__v';
const PREACT_OWNER = '__o';
const REACT_OWNER = '_owner';

// Below this size the cost of building the views needed for a chunked comparison outweighs what
// the wider comparison saves.
const CHUNKED_COMPARISON_MIN_BYTES = 128;

// The chunked comparison is the only use of `BigUint64Array`, which post-dates the ES2015 target
// the bundles are built to. Capturing its availability once keeps the element-wise loop as a
// working fallback rather than making the whole comparator throw where it is missing.
const HAS_BIG_UINT_64_ARRAY = typeof BigUint64Array !== 'undefined';

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
export function areArrayBuffersEqual(a: ArrayBufferLike, b: ArrayBufferLike): boolean {
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
 * explicitly. `cause` is compared by value rather than by reference, matching how every other
 * nested value in the comparison is treated. Own enumerable properties (which custom `Error`
 * subclasses commonly add) are compared by composing this with the object comparator in the
 * comparator config, so that the strict and circular variants apply to them as well.
 */
export function areErrorsEqual(a: Error, b: Error, state: State<any>): boolean {
  return (
    a.name === b.name
    && a.message === b.message
    && a.stack === b.stack
    && state.equals(a.cause, b.cause, 'cause', 'cause', a, b, state)
  );
}

/**
 * Whether the `Map`s are equal in value.
 */
export function areMapsEqual(a: Map<any, any>, b: Map<any, any>, state: State<any>): boolean {
  return compareMapEntries(a, b, state, false);
}

/**
 * Whether the `Map`s are equal in value, resolving entries by key lookup where possible.
 *
 * @note
 * Entry order is not significant, so matching otherwise requires scanning all of `b` for every
 * entry of `a`. `Map.prototype.has` resolves the common cases -- primitive keys, and object keys
 * held by shared reference -- in constant time instead, leaving only the entries it cannot resolve
 * to the exhaustive scan.
 *
 * This is only installed when the default internal comparator is in use. The comparisons it skips
 * are ones that comparator provably resolves the same way: an identity key comparison always
 * returns `true` (the comparator short-circuits on `a === b`), and the key comparisons against
 * non-matching entries of `b` always return `false`. A custom internal comparator can observe the
 * difference, because it receives the iteration index of the key within `b` and is not guaranteed
 * to be transitive, so it keeps the exhaustive scan.
 */
export function areMapsEqualByLookup(a: Map<any, any>, b: Map<any, any>, state: State<any>): boolean {
  return compareMapEntries(a, b, state, true);
}

/**
 * Whether the objects are equal in value.
 */
export function areObjectsEqual(a: AnyObject, b: AnyObject, state: State<any>): boolean {
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
export function areObjectsEqualStrict(a: AnyObject, b: AnyObject, state: State<any>): boolean {
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
  return compareSetValues(a, b, state, false);
}

/**
 * Whether the `Set`s are equal in value, resolving values by lookup where possible.
 *
 * @note
 * See `areMapsEqualByLookup` for why this is only installed for the default internal comparator.
 * Because `Set` values are unique, each lookup hit claims exactly one entry of `b`, so the values
 * left for the exhaustive scan are precisely those each set does not share with the other.
 */
export function areSetsEqualByLookup(a: Set<any>, b: Set<any>, state: State<any>): boolean {
  return compareSetValues(a, b, state, true);
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
  if (a instanceof Float64Array || a instanceof Float32Array || isFloat16Array(a)) {
    while (index-- > 0) {
      // `NaN` is the only value not equal to itself, and it is treated as equal here to match
      // the SameValueZero semantics used for every other numeric comparison in the library.
      if (a[index] !== b[index] && (a[index] === a[index] || b[index] === b[index])) {
        return false;
      }
    }

    return true;
  }

  const byteLength = a.byteLength;

  // Leading elements already accounted for by the chunked comparison below.
  let compared = 0;

  // Integer views hold no padding and no values with multiple representations, so comparing the
  // underlying bytes eight at a time is equivalent to comparing elements, and substantially faster
  // for large buffers. `BigUint64Array` requires an 8-byte-aligned offset, and the byte offsets are
  // already known to match, so only `a` needs to be checked.
  if (HAS_BIG_UINT_64_ARRAY && byteLength >= CHUNKED_COMPARISON_MIN_BYTES && (a.byteOffset & 7) === 0) {
    const words = byteLength >>> 3;
    const wordsA = new BigUint64Array(a.buffer, a.byteOffset, words);
    const wordsB = new BigUint64Array(b.buffer, b.byteOffset, words);

    let wordIndex = words;

    while (wordIndex-- > 0) {
      if (wordsA[wordIndex] !== wordsB[wordIndex]) {
        return false;
      }
    }

    // Every element size divides eight, so the bytes compared always cover whole elements, and
    // whatever did not fill a word is left to the loop below rather than needing a pass of its own.
    compared = (words << 3) / a.BYTES_PER_ELEMENT;
  }

  while (index-- > compared) {
    if (a[index] !== b[index]) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the URL search params passed are equal in value.
 *
 * @note
 * Order is not significant, matching how the other unordered collections in the library are
 * compared. Repeated keys are, so this is a comparison of multisets rather than of sets:
 * `a=1&a=2` is equal to `a=2&a=1`, but not to `a=1&a=1`.
 */
export function areUrlSearchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  // Identical serializations are equal under any ordering, and this is by far the common case, so
  // it is worth checking before sorting anything.
  return a.toString() === b.toString() || sortSearchParams(a) === sortSearchParams(b);
}

/**
 * Whether the URL instances are equal in value.
 *
 * @note
 * Every component is compared, including the query string, which is compared without regard to
 * parameter order. See `areUrlSearchParamsEqual`.
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
    && areUrlSearchParamsEqual(a.searchParams, b.searchParams)
  );
}

/**
 * Match the entries of two `Map`s, which are equal when every entry of `a` can be paired with a
 * distinct entry of `b`. When `byLookup` is set, entries whose key is present in `b` by identity
 * are paired directly, and only what remains is matched by the exhaustive scan.
 */
function compareMapEntries(a: Map<any, any>, b: Map<any, any>, state: State<any>, byLookup: boolean): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  let unmatchedA: Array<[any, any]>;
  let claimedB: Set<any> | undefined;

  if (byLookup) {
    const deferred: Array<[any, any]> = [];

    for (const entry of a) {
      const key = entry[0];

      // `has` uses SameValueZero, which is the same result the comparator produces for the keys it
      // resolves here, since it short-circuits on reference equality before any value comparison.
      if (b.has(key) && state.equals(entry[1], b.get(key), key, key, a, b, state)) {
        (claimedB ||= new Set()).add(key);
      } else {
        deferred.push(entry);
      }
    }

    if (!deferred.length) {
      return true;
    }

    unmatchedA = deferred;
  } else {
    unmatchedA = Array.from(a);
  }

  const unmatchedB: Array<[any, any]> = [];

  for (const entry of b) {
    if (!claimedB || !claimedB.has(entry[0])) {
      unmatchedB.push(entry);
    }
  }

  const matchedIndices = new Uint8Array(unmatchedB.length);

  for (let index = 0; index < unmatchedA.length; index++) {
    const aEntry = unmatchedA[index]!;

    let hasMatch = 0;

    for (let matchIndex = 0; matchIndex < unmatchedB.length; matchIndex++) {
      if (matchedIndices[matchIndex]) {
        continue;
      }

      const bEntry = unmatchedB[matchIndex]!;

      if (
        state.equals(aEntry[0], bEntry[0], index, matchIndex, a, b, state)
        && state.equals(aEntry[1], bEntry[1], aEntry[0], bEntry[0], a, b, state)
      ) {
        hasMatch = matchedIndices[matchIndex] = 1;
        break;
      }
    }

    if (!hasMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Match the values of two `Set`s. See `compareMapEntries`, which this mirrors.
 */
function compareSetValues(a: Set<any>, b: Set<any>, state: State<any>, byLookup: boolean): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  let unmatchedA: any[];

  if (byLookup) {
    const deferred: any[] = [];

    for (const value of a) {
      if (!b.has(value)) {
        deferred.push(value);
      }
    }

    if (!deferred.length) {
      return true;
    }

    unmatchedA = deferred;
  } else {
    unmatchedA = Array.from(a);
  }

  const unmatchedB: any[] = [];

  for (const value of b) {
    if (!byLookup || !a.has(value)) {
      unmatchedB.push(value);
    }
  }

  const matchedIndices = new Uint8Array(unmatchedB.length);

  for (let index = 0; index < unmatchedA.length; index++) {
    const aValue = unmatchedA[index];

    let hasMatch = 0;

    for (let matchIndex = 0; matchIndex < unmatchedB.length; matchIndex++) {
      const bValue = unmatchedB[matchIndex];

      if (!matchedIndices[matchIndex] && state.equals(aValue, bValue, aValue, bValue, a, b, state)) {
        hasMatch = matchedIndices[matchIndex] = 1;
        break;
      }
    }

    if (!hasMatch) {
      return false;
    }
  }

  return true;
}

/**
 * Serialize search params into a form that ignores their order. Encoding both halves of each pair
 * keeps `=` and `&` out of either, so the joined result is unambiguous and two sets of params hold
 * the same pairs, the same number of times, exactly when it matches.
 */
function sortSearchParams(params: URLSearchParams): string {
  return Array.from(params, ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
    .sort()
    .join('&');
}

/**
 * Whether the value is a `Float16Array`, guarded for environments that predate it.
 */
function isFloat16Array(value: TypedArray): boolean {
  return typeof Float16Array !== 'undefined' && value instanceof Float16Array;
}

function isPropertyEqual(a: AnyObject, b: AnyObject, state: State<any>, property: string | symbol) {
  if (
    (property === REACT_OWNER || property === PREACT_OWNER || property === PREACT_VNODE)
    && (a.$$typeof || b.$$typeof)
  ) {
    return true;
  }

  return hasOwn(b, property) && state.equals(a[property], b[property], property, property, a, b, state);
}
