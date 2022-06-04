import { createComparator, createDefaultIsEqual } from './comparator';
import { areArraysEqual, areArraysEqualCircular } from './arrays';
import { areMapsEqual, areMapsEqualCircular } from './maps';
import { areObjectsEqual, areObjectsEqualCircular } from './objects';
import { areRegExpsEqual } from './regexps';
import { areSetsEqual, areSetsEqualCircular } from './sets';
import { sameValueZeroEqual } from './utils';

import type { CreateComparatorCreatorOptions } from './comparator';

export { sameValueZeroEqual };

const DEFAULT_CONFIG = {
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
};
const DEFAULT_CIRCULAR_CONFIG = {
  ...DEFAULT_CONFIG,
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areSetsEqual: areSetsEqualCircular,
};

const isDeepEqual = createComparator(DEFAULT_CONFIG);

/**
 * Whether the items passed are deeply-equal in value.
 */
export function deepEqual<A, B>(a: A, b: B): boolean {
  return isDeepEqual(a, b, undefined);
}

const isShallowEqual = createComparator({
  ...DEFAULT_CONFIG,
  createIsNestedEqual: () => sameValueZeroEqual,
});

/**
 * Whether the items passed are shallowly-equal in value.
 */
export function shallowEqual<A, B>(a: A, b: B): boolean {
  return isShallowEqual(a, b, undefined);
}

const isCircularDeepEqual = createComparator(DEFAULT_CIRCULAR_CONFIG);

/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export function circularDeepEqual<A, B>(a: A, b: B): boolean {
  return isCircularDeepEqual(a, b, new WeakMap());
}

const isCircularShallowEqual = createComparator({
  ...DEFAULT_CIRCULAR_CONFIG,
  createIsNestedEqual: () => sameValueZeroEqual,
});

/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isCircularShallowEqual(a, b, new WeakMap());
}

/**
 * Create a custom equality comparison method. This can be done to create very targeted
 * comparisons in extreme hot-path scenarios where the standard methods are not performant
 * enough, but can also be used to provide support for legacy environments that do not
 * support expected features like `WeakMap` out of the box.
 */
export function createCustomEqual(
  getComparatorOptions: (
    defaultOptions: CreateComparatorCreatorOptions,
  ) => CreateComparatorCreatorOptions,
) {
  const defaultOptions = {
    ...DEFAULT_CONFIG,
    createIsNestedEqual: createDefaultIsEqual,
  };

  return createComparator({
    ...defaultOptions,
    ...getComparatorOptions(defaultOptions),
  });
}
