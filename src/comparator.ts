import {
  areArrayBuffersEqual,
  areArraysEqual as areArraysEqualDefault,
  areDataViewsEqual,
  areDatesEqual as areDatesEqualDefault,
  areErrorsEqual as areErrorsEqualDefault,
  areMapsEqual as areMapsEqualDefault,
  areMapsEqualByLookup as areMapsEqualByLookupDefault,
  areObjectsEqual as areObjectsEqualDefault,
  areObjectsEqualStrict as areObjectsEqualStrictDefault,
  arePrimitiveWrappersEqual as arePrimitiveWrappersEqualDefault,
  areRegExpsEqual as areRegExpsEqualDefault,
  areSetsEqual as areSetsEqualDefault,
  areSetsEqualByLookup as areSetsEqualByLookupDefault,
  areTypedArraysEqual as areTypedArraysEqualDefault,
  areUrlsEqual as areUrlsEqualDefault,
  sameValueEqual,
  strictEqual,
} from './equals.js';
import type {
  ComparatorConfig,
  CustomEqualCreatorOptions,
  EqualityComparator,
  InternalEqualityComparator,
  State,
} from './internalTypes.js';
import { combineComparators, createIsCircular } from './utils.js';

const toString = Object.prototype.toString;

interface CreateIsEqualOptions<Meta> extends Pick<Required<CustomEqualCreatorOptions<Meta>>, 'circular' | 'strict'> {
  comparator: EqualityComparator<Meta>;
  createState: CustomEqualCreatorOptions<Meta>['createState'];
  equals: InternalEqualityComparator<Meta>;
}

/**
 * Create a comparator method based on the type-specific equality comparators passed.
 */
export function createEqualityComparator<Meta>(config: ComparatorConfig<Meta>): EqualityComparator<Meta> {
  const supportedComparatorMap = createSupportedComparatorMap(config);
  const {
    areArraysEqual,
    areDatesEqual,
    areFunctionsEqual,
    areMapsEqual,
    areNumbersEqual,
    areObjectsEqual,
    areRegExpsEqual,
    areSetsEqual,
    getUnsupportedCustomComparator,
  } = config;
  /**
   * compare the value of the two objects and return true if they are equivalent in values
   */
  return function comparator(a: any, b: any, state: State<Meta>): boolean {
    // If the items are strictly equal, no need to do a value comparison.
    if (a === b) {
      return true;
    }

    // If either of the items are nullish and fail the strictly equal check
    // above, then they must be unequal.
    if (a == null || b == null) {
      return false;
    }

    const type = typeof a;

    if (type !== typeof b) {
      return false;
    }

    if (type !== 'object') {
      if (type === 'number' || type === 'bigint') {
        return areNumbersEqual(a, b, state);
      }

      if (type === 'function') {
        return areFunctionsEqual(a, b, state);
      }

      // If a primitive value that is not strictly equal, it must be unequal.
      return false;
    }

    const constructor = a.constructor;

    // Checks are listed in order of commonality of use-case:
    //   1. Common complex object types (plain object, array)
    //   2. Common data values (date, regexp)
    //   3. Less-common complex object types (map, set)
    //   4. Less-common data values (promise, primitive wrappers)
    // Inherently this is both subjective and assumptive, however
    // when reviewing comparable libraries in the wild this order
    // appears to be generally consistent.

    // Constructors should match, otherwise there is potential for false positives
    // between class and subclass or custom object and POJO.
    if (constructor !== b.constructor) {
      return false;
    }

    // Try to fast-path equality checks for other complex object types in the
    // same realm to avoid capturing the string tag. Strict equality is used
    // instead of `instanceof` because it is more performant for the common
    // use-case. If someone is creating a subclass from a native class, it will be
    // handled with the string tag comparison.

    if (constructor === Object) {
      return areObjectsEqual(a, b, state);
    }

    if (constructor === Array) {
      return areArraysEqual(a, b, state);
    }

    if (constructor === Date) {
      return areDatesEqual(a, b, state);
    }

    if (constructor === RegExp) {
      return areRegExpsEqual(a, b, state);
    }

    if (constructor === Map) {
      return areMapsEqual(a, b, state);
    }

    if (constructor === Set) {
      return areSetsEqual(a, b, state);
    }

    if (constructor === Promise) {
      // Avoid tag checks for promise values, since we know if they are not referentially equal
      // then they are not equal.
      return false;
    }

    // `isArray()` works on subclasses and is cross-realm, so we can avoid capturing
    // the string tag or doing an `instanceof` in edge cases.
    if (Array.isArray(a)) {
      return areArraysEqual(a, b, state);
    }

    // Since this is a custom object, capture the string tag to determining its type.
    // This is reasonably performant in modern environments like v8 and SpiderMonkey.
    const tag = toString.call(a);
    const supportedComparator = supportedComparatorMap[tag];

    if (supportedComparator) {
      return supportedComparator(a, b, state);
    }

    const unsupportedCustomComparator =
      getUnsupportedCustomComparator && getUnsupportedCustomComparator(a, b, state, tag);

    if (unsupportedCustomComparator) {
      return unsupportedCustomComparator(a, b, state);
    }

    // If not matching any tags that require a specific type of comparison, then we hard-code false because
    // the only thing remaining is strict equality, which has already been compared. This is for a few reasons:
    //   - Certain types that cannot be introspected (e.g., `WeakMap`). For these types, this is the only
    //     comparison that can be made.
    //   - For types that can be introspected but do not have an objective definition of what
    //     equality is (`Error`, etc.), the subjective decision is to be conservative and strictly compare.
    // In all cases, these decisions should be reevaluated based on changes to the language and
    // common development practices.
    return false;
  };
}

/**
 * Create the configuration object used for building comparators.
 */
export function createEqualityComparatorConfig<Meta>({
  circular,
  createCustomConfig,
  createInternalComparator,
  strict,
}: CustomEqualCreatorOptions<Meta>): ComparatorConfig<Meta> {
  // The `Map` / `Set` lookup comparators skip comparisons that the default internal comparator
  // provably resolves the same way, but a custom one can observe the difference. See the note on
  // `areMapsEqualByLookup` for the reasoning.
  const areMapsEqualBase = createInternalComparator ? areMapsEqualDefault : areMapsEqualByLookupDefault;
  const areSetsEqualBase = createInternalComparator ? areSetsEqualDefault : areSetsEqualByLookupDefault;

  let config = {
    areArrayBuffersEqual,
    areArraysEqual: strict ? areObjectsEqualStrictDefault : areArraysEqualDefault,
    areDataViewsEqual,
    areDatesEqual: areDatesEqualDefault,
    // `Error` subclasses routinely carry their own enumerable properties (`status`, `code`, ...),
    // which the error comparator alone does not see, so it is composed with the object comparator.
    // The non-strict comparator is used even in strict mode: `name` / `message` / `stack` are own
    // but non-enumerable, so a strict comparison here would additionally require both errors to
    // have been constructed with the same own-property shape, which is a separate semantic
    // question from whether they are equal in value.
    areErrorsEqual: combineComparators(areErrorsEqualDefault, areObjectsEqualDefault),
    areFunctionsEqual: strictEqual,
    areMapsEqual: strict ? combineComparators(areMapsEqualBase, areObjectsEqualStrictDefault) : areMapsEqualBase,
    areNumbersEqual: sameValueEqual,
    areObjectsEqual: strict ? areObjectsEqualStrictDefault : areObjectsEqualDefault,
    arePrimitiveWrappersEqual: arePrimitiveWrappersEqualDefault,
    areRegExpsEqual: areRegExpsEqualDefault,
    areSetsEqual: strict ? combineComparators(areSetsEqualBase, areObjectsEqualStrictDefault) : areSetsEqualBase,
    areTypedArraysEqual: strict
      ? combineComparators(areTypedArraysEqualDefault, areObjectsEqualStrictDefault)
      : areTypedArraysEqualDefault,
    areUrlsEqual: areUrlsEqualDefault,
    getUnsupportedCustomComparator: undefined,
  };

  if (createCustomConfig) {
    config = Object.assign({}, config, createCustomConfig(config));
  }

  if (circular) {
    const areArraysEqual = createIsCircular(config.areArraysEqual);
    // Errors are included because comparing `cause` and own properties by value means an error
    // that references itself would otherwise recurse without bound.
    const areErrorsEqual = createIsCircular(config.areErrorsEqual);
    const areMapsEqual = createIsCircular(config.areMapsEqual);
    const areObjectsEqual = createIsCircular(config.areObjectsEqual);
    const areSetsEqual = createIsCircular(config.areSetsEqual);

    config = Object.assign({}, config, {
      areArraysEqual,
      areErrorsEqual,
      areMapsEqual,
      areObjectsEqual,
      areSetsEqual,
    });
  }

  return config;
}

/**
 * Default equality comparator pass-through, used as the standard `isEqual` creator for
 * use inside the built comparator.
 */
export function createInternalEqualityComparator<Meta>(
  compare: EqualityComparator<Meta>,
): InternalEqualityComparator<Meta> {
  return function (
    a: any,
    b: any,
    _indexOrKeyA: any,
    _indexOrKeyB: any,
    _parentA: any,
    _parentB: any,
    state: State<Meta>,
  ) {
    return compare(a, b, state);
  };
}

/**
 * Create the `isEqual` function used by the consuming application.
 */
export function createIsEqual<Meta>({ circular, comparator, createState, equals, strict }: CreateIsEqualOptions<Meta>) {
  if (createState) {
    return function isEqual<A, B>(a: A, b: B): boolean {
      const { cache = circular ? new WeakMap() : undefined, meta } = createState();

      return comparator(a, b, {
        cache,
        equals,
        meta,
        strict,
      } as State<Meta>);
    };
  }

  if (circular) {
    return function isEqual<A, B>(a: A, b: B): boolean {
      return comparator(a, b, {
        cache: new WeakMap(),
        equals,
        meta: undefined as Meta,
        strict,
      });
    };
  }

  const state = {
    cache: undefined,
    equals,
    meta: undefined,
    strict,
  } as State<Meta>;

  return function isEqual<A, B>(a: A, b: B): boolean {
    return comparator(a, b, state);
  };
}

/**
 * Create a map of `toString()` values to their respective handlers for `tag`-based lookups.
 */
function createSupportedComparatorMap<Meta>({
  areArrayBuffersEqual,
  areArraysEqual,
  areDataViewsEqual,
  areDatesEqual,
  areErrorsEqual,
  areFunctionsEqual,
  areMapsEqual,
  areObjectsEqual,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
  areTypedArraysEqual,
  areUrlsEqual,
}: ComparatorConfig<Meta>): Record<string, EqualityComparator<any>> {
  return {
    '[object Arguments]': areObjectsEqual,
    '[object Array]': areArraysEqual,
    '[object ArrayBuffer]': areArrayBuffersEqual,
    '[object AsyncGeneratorFunction]': areFunctionsEqual,
    '[object BigInt]': arePrimitiveWrappersEqual,
    '[object BigInt64Array]': areTypedArraysEqual,
    '[object BigUint64Array]': areTypedArraysEqual,
    '[object Boolean]': arePrimitiveWrappersEqual,
    '[object DataView]': areDataViewsEqual,
    '[object Date]': areDatesEqual,
    // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
    // enumerable, and therefore will give false positives if tested like a standard object.
    '[object Error]': areErrorsEqual,
    '[object Float16Array]': areTypedArraysEqual,
    '[object Float32Array]': areTypedArraysEqual,
    '[object Float64Array]': areTypedArraysEqual,
    '[object Function]': areFunctionsEqual,
    '[object GeneratorFunction]': areFunctionsEqual,
    '[object Int8Array]': areTypedArraysEqual,
    '[object Int16Array]': areTypedArraysEqual,
    '[object Int32Array]': areTypedArraysEqual,
    '[object Map]': areMapsEqual,
    '[object Number]': arePrimitiveWrappersEqual,
    '[object Object]': (a: any, b: any, state: any) =>
      // The exception for value comparison is custom `Promise`-like class instances. These should
      // be treated the same as standard `Promise` objects, which means strict equality, and if
      // it reaches this point then that strict equality comparison has already failed.
      typeof a.then !== 'function' && typeof b.then !== 'function' && areObjectsEqual(a, b, state),
    // For RegExp, the properties are not enumerable, and therefore will give false positives if
    // tested like a standard object.
    '[object RegExp]': areRegExpsEqual,
    '[object Set]': areSetsEqual,
    '[object String]': arePrimitiveWrappersEqual,
    '[object Symbol]': arePrimitiveWrappersEqual,
    '[object URL]': areUrlsEqual,
    '[object Uint8Array]': areTypedArraysEqual,
    '[object Uint8ClampedArray]': areTypedArraysEqual,
    '[object Uint16Array]': areTypedArraysEqual,
    '[object Uint32Array]': areTypedArraysEqual,
  };
}
