import { createComparator, createDefaultIsEqual } from './comparator';
import { areArraysEqual, areArraysEqualCircular } from './arrays';
import { areMapsEqual, areMapsEqualCircular } from './maps';
import { areObjectsEqual, areObjectsEqualCircular } from './objects';
import { areRegExpsEqual } from './regexps';
import { areSetsEqual, areSetsEqualCircular } from './sets';
import { sameValueZeroEqual } from './utils';

import type { CreateComparatorCreatorOptions } from './comparator';

export { sameValueZeroEqual };

const isDeepEqual = createComparator({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
});
export function deepEqual<A, B>(a: A, b: B): boolean {
  return isDeepEqual(a, b, undefined);
}

const isShallowEqual = createComparator({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createIsNestedEqual: () => sameValueZeroEqual,
});
export function shallowEqual<A, B>(a: A, b: B): boolean {
  return isShallowEqual(a, b, undefined);
}

const isCircularDeepEqual = createComparator({
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areRegExpsEqual,
  areSetsEqual: areSetsEqualCircular,
});
export function circularDeepEqual<A, B>(a: A, b: B): boolean {
  return isCircularDeepEqual(a, b, new WeakMap());
}

const isCircularShallowEqual = createComparator({
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areRegExpsEqual,
  areSetsEqual: areSetsEqualCircular,
  createIsNestedEqual: () => sameValueZeroEqual,
});
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isCircularShallowEqual(a, b, new WeakMap());
}

export function createCustomEqual(
  getComparatorOptions: (
    defaultOptions: CreateComparatorCreatorOptions,
  ) => CreateComparatorCreatorOptions,
) {
  return createComparator(
    getComparatorOptions({
      areArraysEqual,
      areMapsEqual,
      areObjectsEqual,
      areRegExpsEqual,
      areSetsEqual,
      createIsNestedEqual: createDefaultIsEqual,
    }),
  );
}
