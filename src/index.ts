import { createComparatorCreator } from './comparator';
import { areArraysEqual, areArraysEqualCircular } from './arrays';
import { areMapsEqual, areMapsEqualCircular } from './maps';
import { areObjectsEqual, areObjectsEqualCircular } from './objects';
import { areSetsEqual, areSetsEqualCircular } from './sets';
import { sameValueZeroEqual } from './utils';

export { sameValueZeroEqual };

const createStandardEqual = createComparatorCreator({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
});

const createCircularEqual = createComparatorCreator({
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areSetsEqual: areSetsEqualCircular,
});

const isDeepEqual = createStandardEqual();
export function deepEqual<A, B>(a: A, b: B): boolean {
  return isDeepEqual(a, b, undefined);
}

const isShallowEqual = createStandardEqual(() => sameValueZeroEqual);
export function shallowEqual<A, B>(a: A, b: B): boolean {
  return isShallowEqual(a, b, undefined);
}

const isCircularDeepEqual = createCircularEqual();
export function circularDeepEqual<A, B>(a: A, b: B): boolean {
  return isCircularDeepEqual(a, b, new WeakMap());
}

const isCircularShallowEqual = createCircularEqual(() => sameValueZeroEqual);
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isCircularShallowEqual(a, b, new WeakMap());
}

export const createCustomEqual = createComparatorCreator({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
});
