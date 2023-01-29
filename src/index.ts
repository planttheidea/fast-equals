import { createComparator } from './comparator';
import {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
} from './equals';
import type { CreateComparatorCreatorOptions } from './internalTypes';
import {
  createDefaultComparator,
  createDefaultIsNestedEqual,
  createIsCircular,
  sameValueZeroEqual,
} from './utils';

export { sameValueZeroEqual };

const DEFAULT_CONFIG: CreateComparatorCreatorOptions = Object.freeze({
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createIsNestedEqual: createDefaultIsNestedEqual,
});

const areArraysEqualCircular = createIsCircular(areArraysEqual);
const areMapsEqualCircular = createIsCircular(areMapsEqual);
const areObjectsEqualCircular = createIsCircular(areObjectsEqual);
const areSetsEqualCircular = createIsCircular(areSetsEqual);

const DEFAULT_CIRCULAR_CONFIG: CreateComparatorCreatorOptions = Object.freeze({
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

const isEqualComparator = createDefaultComparator(isEqual);
const isEqualCircularComparator = createDefaultComparator(isEqualCircular);

/**
 * Whether the items passed are deeply-equal in value.
 */
export function deepEqual<A, B>(a: A, b: B): boolean {
  return isEqual(a, b, {
    __c: undefined,
    compare: isEqualComparator,
    strict: false,
  });
}

/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export function circularDeepEqual<A, B>(a: A, b: B): boolean {
  return isEqualCircular(a, b, {
    __c: new WeakMap(),
    compare: isEqualCircularComparator,
    strict: false,
  });
}

/**
 * Whether the items passed are shallowly-equal in value.
 */
export function shallowEqual<A, B>(a: A, b: B): boolean {
  return isEqual(a, b, {
    __c: undefined,
    compare: sameValueZeroEqual,
    strict: false,
  });
}

/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isEqualCircular(a, b, {
    __c: new WeakMap(),
    compare: sameValueZeroEqual,
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
//   getComparatorOptions: GetComparatorOptions,
// ): EqualityComparator {
//   return createComparator(
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
// >(getComparatorOptions: GetComparatorOptions): EqualityComparator {
//   const comparator = createComparator(
//     merge(
//       DEFAULT_CIRCULAR_CONFIG,
//       getComparatorOptions(DEFAULT_CIRCULAR_CONFIG as any),
//     ),
//   );

//   return ((a: any, b: any, meta: any = new WeakMap()) =>
//     comparator(a, b, meta)) as EqualityComparator;
// }
