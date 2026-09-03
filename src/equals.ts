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
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  const matchedIndices = new Uint8Array(size);
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

    let hasMatch = 0;
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
        hasMatch = matchedIndices[matchIndex] = 1;
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
 * Whether the `Map`s are equal in value, resolving entries by key lookup where possible.
 *
 * @note
 * `areMapsEqual` must scan all of `b` for every entry of `a` because entry order is not
 * significant, which is quadratic. `Map.prototype.has` resolves the common cases -- primitive keys,
 * and object keys held by shared reference -- in constant time instead, leaving only the entries it
 * cannot resolve to the exhaustive scan.
 *
 * This is only installed when the default internal comparator is in use. The comparisons it skips
 * are ones that comparator provably resolves the same way: an identity key comparison always
 * returns `true` (the comparator short-circuits on `a === b`), and the key comparisons against
 * non-matching entries of `b` always return `false`. A custom internal comparator can observe the
 * difference, because it receives the iteration index of the key within `b` and is not guaranteed
 * to be transitive, so it keeps the exhaustive scan.
 */
export function areMapsEqualByLookup(a: Map<any, any>, b: Map<any, any>, state: State<any>): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  let unmatchedA: Array<[any, any]> | undefined;
  let claimedB: Set<any> | undefined;

  for (const aEntry of a) {
    const key = aEntry[0];

    // `has` uses SameValueZero, which is the same result the comparator produces for the keys it
    // resolves here, since it short-circuits on reference equality before any value comparison.
    if (b.has(key) && state.equals(aEntry[1], b.get(key), key, key, a, b, state)) {
      (claimedB ||= new Set()).add(key);
    } else {
      (unmatchedA ||= []).push(aEntry);
    }
  }

  if (!unmatchedA) {
    return true;
  }

  const unmatchedB: Array<[any, any]> = [];

  for (const bEntry of b) {
    if (!claimedB || !claimedB.has(bEntry[0])) {
      unmatchedB.push(bEntry);
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
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  const matchedIndices = new Uint8Array(size);
  const aIterable = a.values();

  let aResult: IteratorResult<any>;
  let bResult: IteratorResult<any>;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  while ((aResult = aIterable.next())) {
    if (aResult.done) {
      break;
    }

    const bIterable = b.values();

    let hasMatch = 0;
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
        hasMatch = matchedIndices[matchIndex] = 1;
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
 * Whether the `Set`s are equal in value, resolving values by lookup where possible.
 *
 * @note
 * See `areMapsEqualByLookup` for why this is only installed for the default internal comparator.
 * Because `Set` values are unique, each lookup hit claims exactly one entry of `b`, so the entries
 * left for the exhaustive scan are precisely those each set does not share with the other.
 */
export function areSetsEqualByLookup(a: Set<any>, b: Set<any>, state: State<any>): boolean {
  const size = a.size;

  if (size !== b.size) {
    return false;
  }

  if (!size) {
    return true;
  }

  let unmatchedA: any[] | undefined;

  for (const aValue of a) {
    if (!b.has(aValue)) {
      (unmatchedA ||= []).push(aValue);
    }
  }

  if (!unmatchedA) {
    return true;
  }

  const unmatchedB: any[] = [];

  for (const bValue of b) {
    if (!a.has(bValue)) {
      unmatchedB.push(bValue);
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
 * Whether the TypedArray instances are equal in value.
 */
export function areTypedArraysEqual(a: TypedArray, b: TypedArray) {
  let index = a.length;

  if (b.length !== index || a.byteOffset !== b.byteOffset) {
    return false;
  }

  const byteLength = a.byteLength;

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

    // Whatever does not fill a whole word is compared as bytes.
    const remainder = byteLength & 7;

    if (remainder) {
      const offset = a.byteOffset + (words << 3);
      const bytesA = new Uint8Array(a.buffer, offset, remainder);
      const bytesB = new Uint8Array(b.buffer, b.byteOffset + (words << 3), remainder);

      let byteIndex = remainder;

      while (byteIndex-- > 0) {
        if (bytesA[byteIndex] !== bytesB[byteIndex]) {
          return false;
        }
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
 * Whether the URL search params passed are equal in value.
 *
 * @note
 * Order is not significant, matching how the other unordered collections in the library are
 * compared. Repeated keys are, so this is a comparison of multisets rather than of sets:
 * `a=1&a=2` is equal to `a=2&a=1`, but not to `a=1&a=1`.
 */
export function areUrlSearchParamsEqual(a: URLSearchParams, b: URLSearchParams): boolean {
  // Identical serializations are equal under any ordering, and this is by far the common case, so
  // it is worth avoiding the entry arrays entirely when it holds.
  if (a.toString() === b.toString()) {
    return true;
  }

  const entriesA = Array.from(a);
  const entriesB = Array.from(b);

  let index = entriesA.length;

  if (entriesB.length !== index) {
    return false;
  }

  entriesA.sort(compareEntries);
  entriesB.sort(compareEntries);

  while (index-- > 0) {
    const entryA = entriesA[index]!;
    const entryB = entriesB[index]!;

    if (entryA[0] !== entryB[0] || entryA[1] !== entryB[1]) {
      return false;
    }
  }

  return true;
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
 * Order search param entries by key, then by value, so that two sets of entries holding the same
 * pairs in different orders align for a positional comparison.
 */
function compareEntries(a: [string, string], b: [string, string]): number {
  if (a[0] !== b[0]) {
    return a[0] < b[0] ? -1 : 1;
  }

  if (a[1] !== b[1]) {
    return a[1] < b[1] ? -1 : 1;
  }

  return 0;
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
