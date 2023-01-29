import { createComparator } from './comparator';
import {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
} from './equals';
import type {
  BaseCircularMeta,
  Cache,
  CreateComparatorCreatorOptions,
  EqualityComparator,
} from './internalTypes';
import {
  createDefaultIsNestedEqual,
  createIsCircular,
  sameValueZeroEqual,
} from './utils';

export { sameValueZeroEqual };

const DEFAULT_CONFIG: CreateComparatorCreatorOptions<undefined> = Object.freeze(
  {
    areArraysEqual,
    areDatesEqual,
    areMapsEqual,
    areObjectsEqual,
    areRegExpsEqual,
    areSetsEqual,
    createIsNestedEqual: createDefaultIsNestedEqual,
  },
);

const areArraysEqualCircular = createIsCircular(areArraysEqual);
const areMapsEqualCircular = createIsCircular(areMapsEqual);
const areObjectsEqualCircular = createIsCircular(areObjectsEqual);
const areSetsEqualCircular = createIsCircular(areSetsEqual);

const DEFAULT_CIRCULAR_CONFIG: CreateComparatorCreatorOptions<BaseCircularMeta> =
  Object.freeze({
    areArraysEqual: areArraysEqualCircular,
    areDatesEqual,
    areMapsEqual: areMapsEqualCircular,
    areObjectsEqual: areObjectsEqualCircular,
    areRegExpsEqual,
    areSetsEqual: areSetsEqualCircular,
    createIsNestedEqual: createDefaultIsNestedEqual,
  });

const isEqual = createComparator(DEFAULT_CONFIG);
const isEqualCircular = createComparator(DEFAULT_CIRCULAR_CONFIG);

function createDefaultComparator<Meta>(compare: EqualityComparator<Meta>) {
  return function (
    a: any,
    b: any,
    _indexOrKeyA: any,
    _indexOrKeyB: any,
    _parentA: any,
    _parentB: any,
    cache: Cache<Meta>,
  ) {
    return compare(a, b, cache);
  };
}

const isEqualComparator = createDefaultComparator(isEqual);
const isEqualCircularComparator = createDefaultComparator(isEqualCircular);

/**
 * Whether the items passed are deeply-equal in value.
 */
export function deepEqual<A, B>(a: A, b: B): boolean {
  return isEqual(a, b, {
    compare: isEqualComparator,
    meta: undefined,
    strict: false,
  });
}

/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export function circularDeepEqual<A, B>(a: A, b: B): boolean {
  return isEqualCircular(a, b, {
    compare: isEqualCircularComparator,
    meta: new WeakMap(),
    strict: false,
  });
}

/**
 * Whether the items passed are shallowly-equal in value.
 */
export function shallowEqual<A, B>(a: A, b: B): boolean {
  return isEqual(a, b, {
    compare: sameValueZeroEqual,
    meta: undefined,
    strict: false,
  });
}

/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isEqualCircular(a, b, {
    compare: sameValueZeroEqual,
    meta: new WeakMap(),
    strict: false,
  });
}

// /**
//  * Create a custom equality comparison method.
//  *
//  * This can be done to create very targeted comparisons in extreme hot-path scenarios
//  * where the standard methods are not performant enough, but can also be used to provide
//  * support for legacy environments that do not support expected features like
//  * `RegExp.prototype.flags` out of the box.
//  */
// export function createCustomEqual<Meta = undefined>(
//   getComparatorOptions: GetComparatorOptions<Meta>,
// ): EqualityComparator<Meta> {
//   return createComparator<Meta>(
//     merge(DEFAULT_CONFIG, getComparatorOptions(DEFAULT_CONFIG as any)),
//   );
// }

// /**
//  * Create a custom equality comparison method that handles circular references. This is very
//  * similar to `createCustomEqual`, with the only difference being that `meta` expects to be
//  * populated with a `WeakMap`-like contract.
//  *
//  * This can be done to create very targeted comparisons in extreme hot-path scenarios
//  * where the standard methods are not performant enough, but can also be used to provide
//  * support for legacy environments that do not support expected features like
//  * `WeakMap` out of the box.
//  */
// export function createCustomCircularEqual<
//   Meta extends BaseCircularMeta = WeakMap<any, any>,
// >(getComparatorOptions: GetComparatorOptions<Meta>): EqualityComparator<Meta> {
//   const comparator = createComparator<Meta>(
//     merge(
//       DEFAULT_CIRCULAR_CONFIG,
//       getComparatorOptions(DEFAULT_CIRCULAR_CONFIG as any),
//     ),
//   );

//   return ((a: any, b: any, meta: any = new WeakMap()) =>
//     comparator(a, b, meta)) as EqualityComparator<Meta>;
// }
