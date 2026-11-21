import {
  areArrayBuffersEqual as areArrayBuffersEqualDefault,
  areArrayBuffersEqualStrict as areArrayBuffersEqualStrictDefault,
  areArraysEqual as areArraysEqualDefault,
  areDataViewsEqual as areDataViewsEqualDefault,
  areDataViewsEqualStrict as areDataViewsEqualStrictDefault,
  areDatesEqual as areDatesEqualDefault,
  areDatesEqualStrict as areDatesEqualStrictDefault,
  areErrorsEqual as areErrorsEqualDefault,
  areErrorsEqualStrict as areErrorsEqualStrictDefault,
  areMapsEqual as areMapsEqualDefault,
  areMapsEqualStrict as areMapsEqualStrictDefault,
  areObjectsEqual as areObjectsEqualDefault,
  areObjectsEqualStrict as areObjectsEqualStrictDefault,
  arePrimitiveWrappersEqual as arePrimitiveWrappersEqualDefault,
  arePrimitiveWrappersEqualStrict as arePrimitiveWrappersEqualStrictDefault,
  areRegExpsEqual as areRegExpsEqualDefault,
  areRegExpsEqualStrict as areRegExpsEqualStrictDefault,
  areSetsEqual as areSetsEqualDefault,
  areSetsEqualStrict as areSetsEqualStrictDefault,
  areTypedArraysEqual as areTypedArraysEqualDefault,
  areTypedArraysEqualStrict as areTypedArraysEqualStrictDefault,
  areUrlSearchParamsEqual as areUrlSearchParamsEqualDefault,
  areUrlSearchParamsEqualStrict as areUrlSearchParamsEqualStrictDefault,
  areUrlsEqual as areUrlsEqualDefault,
  areUrlsEqualStrict as areUrlsEqualStrictDefault,
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
import { createIsCircular, isNullPrototypeComparable } from './utils.js';

interface CreateIsEqualOptions<Meta> extends Pick<Required<CustomEqualCreatorOptions<Meta>>, 'circular' | 'strict'> {
  comparator: EqualityComparator<Meta>;
  createState: CustomEqualCreatorOptions<Meta>['createState'];
  equals: InternalEqualityComparator<Meta>;
}

const { toString } = Object.prototype;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;

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
    strictNullPrototypeComparison,
  } = config;

  /**
   * Whether the custom objects are equal in value, based on their string tag. If not matching any tags
   * that require a specific type of comparison, then we hard-code false because the only thing remaining
   * is strict equality, which has already been compared. This is for a few reasons:
   *   - Certain types that cannot be introspected (e.g., `WeakMap`). For these types, this is the only
   *     comparison that can be made.
   *   - For types that can be introspected but do not have an objective definition of what
   *     equality is (`Error`, etc.), the subjective decision is to be conservative and strictly compare.
   * In all cases, these decisions should be reevaluated based on changes to the language and
   * common development practices.
   *
   * Capturing the tag is reasonably performant in modern environments like v8 and SpiderMonkey. This is
   * kept out of the main comparator so that it stays within the engine's bytecode budget for inlining.
   * See [#207](https://github.com/planttheidea/fast-equals/pull/207) for more details.
   */
  const areTaggedObjectsEqual = getUnsupportedCustomComparator
    ? function areTaggedObjectsEqual(a: any, b: any, state: State<any>): boolean {
        const stringTag = toStringTag && a[toStringTag];
        const tag = stringTag && typeof stringTag === 'string' ? stringTag : toString.call(a);
        const supportedComparator = supportedComparatorMap[tag];

        if (supportedComparator) {
          return supportedComparator(a, b, state);
        }

        const unsupportedCustomComparator = getUnsupportedCustomComparator(
          a,
          b,
          state,
          tag === stringTag ? toString.call(a) : tag,
        );

        return unsupportedCustomComparator ? unsupportedCustomComparator(a, b, state) : false;
      }
    : function areTaggedObjectsEqual(a: any, b: any, state: State<any>): boolean {
        const stringTag = toStringTag && a[toStringTag];
        const supportedComparator =
          supportedComparatorMap[stringTag && typeof stringTag === 'string' ? stringTag : toString.call(a)];

        return supportedComparator ? supportedComparator(a, b, state) : false;
      };

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
    //   3. Less-common complex object types (map, set, null-prototype object)
    //   4. Less-common data values (promise, primitive wrappers)
    // Inherently this is both subjective and assumptive, however
    // when reviewing comparable libraries in the wild this order
    // appears to be generally consistent.

    // Constructors should match, otherwise there is potential for false positives
    // between class and subclass or custom object and POJO.
    if (constructor !== b.constructor) {
      return strictNullPrototypeComparison ? false : isNullPrototypeComparable(a, b) && areObjectsEqual(a, b, state);
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

    if (constructor == null) {
      // Objects with a prototype of `null` are plain objects.
      return areObjectsEqual(a, b, state);
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

    // Since this is a custom object, use the string tag to determine its type.
    return areTaggedObjectsEqual(a, b, state);
  };
}

/**
 * Create the configuration object used for building comparators.
 */
export function createEqualityComparatorConfig<Meta>({
  circular,
  createCustomConfig,
  strict,
  strictNullPrototypeComparison = true,
}: CustomEqualCreatorOptions<Meta>): ComparatorConfig<Meta> {
  // In strict mode, every type compares its own properties in addition to its value, because any
  // object can have properties assigned to it (`date.foo = 'bar'`). For types that hold their value
  // internally (`Date`, `RegExp`, TypedArrays, etc.), only the properties after the intrinsic ones
  // are compared, and circular references among them are tracked by the comparator itself (see
  // `areOwnPropertiesEqualStrict`).
  let config = {
    areArrayBuffersEqual: strict ? areArrayBuffersEqualStrictDefault : areArrayBuffersEqualDefault,
    areArraysEqual: strict ? areObjectsEqualStrictDefault : areArraysEqualDefault,
    areDataViewsEqual: strict ? areDataViewsEqualStrictDefault : areDataViewsEqualDefault,
    areDatesEqual: strict ? areDatesEqualStrictDefault : areDatesEqualDefault,
    // `name` / `message` / `stack` / `cause` / `errors` are not enumerable (unless assigned), which is why
    // errors need a comparator of their own rather than being treated as plain objects. Each variant also
    // compares the own properties that `Error` subclasses routinely carry (`status`, `code`, ...):
    // enumerable ones in loose mode, and all of them (via `areObjectsEqualStrict`) in strict mode.
    areErrorsEqual: strict ? areErrorsEqualStrictDefault : areErrorsEqualDefault,
    areFunctionsEqual: strictEqual,
    areMapsEqual: strict ? areMapsEqualStrictDefault : areMapsEqualDefault,
    areNumbersEqual: sameValueEqual,
    areObjectsEqual: strict ? areObjectsEqualStrictDefault : areObjectsEqualDefault,
    arePrimitiveWrappersEqual: strict ? arePrimitiveWrappersEqualStrictDefault : arePrimitiveWrappersEqualDefault,
    areRegExpsEqual: strict ? areRegExpsEqualStrictDefault : areRegExpsEqualDefault,
    areSetsEqual: strict ? areSetsEqualStrictDefault : areSetsEqualDefault,
    areTypedArraysEqual: strict ? areTypedArraysEqualStrictDefault : areTypedArraysEqualDefault,
    areUrlSearchParamsEqual: strict ? areUrlSearchParamsEqualStrictDefault : areUrlSearchParamsEqualDefault,
    areUrlsEqual: strict ? areUrlsEqualStrictDefault : areUrlsEqualDefault,
    getUnsupportedCustomComparator: undefined,
    strictNullPrototypeComparison,
  };

  if (createCustomConfig) {
    config = Object.assign({}, config, createCustomConfig(config));
  }

  if (circular) {
    // Only containers are wrapped, since they always compare nested values. Types that hold their
    // value internally only do so for own properties in strict mode, and track those themselves.
    // Errors are included because comparing `cause` and own properties by value means an error
    // that references itself would otherwise recurse without bound.
    config = Object.assign({}, config, {
      areArraysEqual: createIsCircular(config.areArraysEqual),
      areErrorsEqual: createIsCircular(config.areErrorsEqual),
      areMapsEqual: createIsCircular(config.areMapsEqual),
      areObjectsEqual: createIsCircular(config.areObjectsEqual),
      areSetsEqual: createIsCircular(config.areSetsEqual),
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
function createSupportedComparatorMap<Meta>(config: ComparatorConfig<Meta>): Record<string, EqualityComparator<any>> {
  return (
    [
      ['Arguments', config.areObjectsEqual],
      ['Array', config.areArraysEqual],
      ['ArrayBuffer', config.areArrayBuffersEqual],
      ['AsyncGeneratorFunction', config.areFunctionsEqual],
      ['BigInt', config.arePrimitiveWrappersEqual],
      ['BigInt64Array', config.areTypedArraysEqual],
      ['BigUint64Array', config.areTypedArraysEqual],
      ['Boolean', config.arePrimitiveWrappersEqual],
      ['DataView', config.areDataViewsEqual],
      ['Date', config.areDatesEqual],
      // If an error tag, it should be tested explicitly. Like RegExp, the properties are not
      // enumerable, and therefore will give false positives if tested like a standard object.
      ['Error', config.areErrorsEqual],
      ['Float16Array', config.areTypedArraysEqual],
      ['Float32Array', config.areTypedArraysEqual],
      ['Float64Array', config.areTypedArraysEqual],
      ['Function', config.areFunctionsEqual],
      ['GeneratorFunction', config.areFunctionsEqual],
      ['Int8Array', config.areTypedArraysEqual],
      ['Int16Array', config.areTypedArraysEqual],
      ['Int32Array', config.areTypedArraysEqual],
      ['Map', config.areMapsEqual],
      ['Number', config.arePrimitiveWrappersEqual],
      [
        'Object',
        (a: any, b: any, state: any) =>
          // The exception for value comparison is custom `Promise`-like class instances. These should
          // be treated the same as standard `Promise` objects, which means strict equality, and if
          // it reaches this point then that strict equality comparison has already failed.
          typeof a.then !== 'function' && typeof b.then !== 'function' && config.areObjectsEqual(a, b, state),
      ],
      // For RegExp, the properties are not enumerable, and therefore will give false positives if
      // tested like a standard object.
      ['RegExp', config.areRegExpsEqual],
      ['Set', config.areSetsEqual],
      ['String', config.arePrimitiveWrappersEqual],
      ['URL', config.areUrlsEqual],
      ['URLSearchParams', config.areUrlSearchParamsEqual],
      ['Uint8Array', config.areTypedArraysEqual],
      ['Uint8ClampedArray', config.areTypedArraysEqual],
      ['Uint16Array', config.areTypedArraysEqual],
      ['Uint32Array', config.areTypedArraysEqual],
    ] as const
  ).reduce<Record<string, EqualityComparator<any>>>((comparatorMap, [tag, comparator]) => {
    comparatorMap[tag] = comparatorMap[`[object ${tag}]`] = comparator;

    return comparatorMap;
  }, Object.create(null));
}
