import type { AnyObject, Cache, CircularState, EqualityComparator, State } from './internalTypes.js';

const { getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { hasOwnProperty, toString } = Object.prototype;

const OBJECT_TAG = '[object Object]';

/**
 * Whether the own properties from `end` onward are equal with strict property checking, where the
 * caller has already verified that both objects have the same number of own properties.
 */
export function areStrictPropertiesEqual(
  a: AnyObject,
  b: AnyObject,
  state: State<any>,
  properties: Array<string | symbol>,
  end: number,
): boolean {
  let index = properties.length;
  let property: string | symbol;
  let descriptorA: ReturnType<typeof getOwnPropertyDescriptor>;
  let descriptorB: ReturnType<typeof getOwnPropertyDescriptor>;

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > end) {
    property = properties[index]!;

    if (
      !isReactProperty(a, b, property)
      && (!hasOwn(b, property) || !state.equals(a[property], b[property], property, property, a, b, state))
    ) {
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
 * Combine two comparators into a single comparators.
 */
export function combineComparators<Meta>(comparatorA: EqualityComparator<Meta>, comparatorB: EqualityComparator<Meta>) {
  return function isEqual<A, B>(a: A, b: B, state: State<Meta>) {
    return comparatorA(a, b, state) && comparatorB(a, b, state);
  };
}

/**
 * Wrap the provided `areItemsEqual` method to manage the circular state, allowing
 * for circular references to be safely included in the comparison without creating
 * stack overflows.
 */
export function createIsCircular<AreItemsEqual extends EqualityComparator<any>>(
  areItemsEqual: AreItemsEqual,
): AreItemsEqual {
  return function isCircular(a: any, b: any, state: CircularState<Cache<any, any>>) {
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object') {
      return areItemsEqual(a, b, state);
    }

    const { cache } = state;

    const cachedA = cache.get(a);
    const cachedB = cache.get(b);

    if (cachedA && cachedB) {
      return cachedA === b && cachedB === a;
    }

    cache.set(a, b);
    cache.set(b, a);

    const result = areItemsEqual(a, b, state);

    cache.delete(a);
    cache.delete(b);

    return result;
  } as AreItemsEqual;
}

/**
 * Get the properties to strictly examine, which include both own properties that are
 * not enumerable and symbol properties.
 */
export function getStrictProperties(object: AnyObject): Array<string | symbol> {
  const symbols = getOwnPropertySymbols(object);

  return symbols.length
    ? (getOwnPropertyNames(object) as Array<string | symbol>).concat(symbols)
    : getOwnPropertyNames(object);
}

/**
 * Identify the element type of TypedArrays across realms and subclasses.
 */
export const getTypedArrayTag = getOwnPropertyDescriptor(
  Object.getPrototypeOf(Int8Array.prototype),
  Symbol.toStringTag,
)!.get!;

/**
 * Whether the object contains the property passed as an own property.
 */
export const hasOwn =
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  Object.hasOwn || ((object: AnyObject, property: number | string | symbol) => hasOwnProperty.call(object, property));

/**
 * Whether a null-prototype object is being compared with a plain object. Only one side can be
 * null-prototype when the constructors differ. The other side must be a plain object by
 * constructor, or by tag when it comes from another realm.
 */
export function isNullPrototypeComparable(a: any, b: any): boolean {
  const aConstructor = a.constructor;
  const bConstructor = b.constructor;

  if (aConstructor == null) {
    return bConstructor === Object || toString.call(b) === OBJECT_TAG;
  }

  if (bConstructor == null) {
    return aConstructor === Object || toString.call(a) === OBJECT_TAG;
  }

  return false;
}

/**
 * Whether the property passed is a property specific to React/Preact elements. These are ignored in comparison, as they
 * are deeply circular and will return frequent false negatives for the comparison that matters, which is often the
 * React element's aspects (`props`, `type`, etc.).
 */
export function isReactProperty(a: AnyObject, b: AnyObject, property: string | symbol): boolean {
  return (
    // _owner -> React owner
    // __o -> Preact owner
    // __v -> Preact vnode
    (property === '_owner' || property === '__o' || property === '__v') && !!(a.$$typeof || b.$$typeof)
  );
}

/**
 * Reorder a serialized query string so that params holding the same pairs compare as equal
 * regardless of the order they appear in.
 *
 * @note
 * The serializer percent-encodes `&` and `=` wherever they appear inside a name or a value, so
 * splitting on `&` recovers exactly the pairs and nothing else.
 */
export function sortSearchParams(serialized: string): string {
  return serialized.split('&').sort().join('&');
}
