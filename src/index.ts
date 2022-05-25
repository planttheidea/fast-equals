import { getNewCache } from "./cache";
import { createComparatorCreator } from "./comparator";
import { areArraysEqual, areArraysEqualCircular } from "./arrays";
import { areMapsEqual, areMapsEqualCircular } from "./maps";
import { areObjectsEqual, areObjectsEqualCircular } from "./objects";
import { areSetsEqual, areSetsEqualCircular } from "./sets";
import { sameValueZeroEqual } from "./utils";

import type { Cache } from "./cache";
import type { EqualityComparatorCreator } from "./comparator";

export type CreateMeta<Meta> = () => Meta;

export { sameValueZeroEqual };

const createStandardEqual = createComparatorCreator<undefined>({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
});

const createCircularEqual = createComparatorCreator<Cache>({
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
  return isCircularDeepEqual(a, b, getNewCache());
}

const isCircularShallowEqual = createCircularEqual(() => sameValueZeroEqual);
export function circularShallowEqual<A, B>(a: A, b: B): boolean {
  return isCircularShallowEqual(a, b, getNewCache());
}

export interface CreateCustomEqualOptions<Meta = any> {
  createMeta?: CreateMeta<Meta>;
  isEqual?: EqualityComparatorCreator;
}

export const createCustomEqual = createComparatorCreator<undefined>({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
});
