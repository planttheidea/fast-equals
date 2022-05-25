import { getNewCache } from "./cache";
import { createComparatorCreator } from "./comparator";
import { areArraysEqual, areArraysEqualCircular } from "./arrays";
import { areMapsEqual, areMapsEqualCircular } from "./maps";
import { areObjectsEqual, areObjectsEqualCircular } from "./objects";
import { areSetsEqual, areSetsEqualCircular } from "./sets";
import { sameValueZeroEqual } from "./utils";

import type { Cache } from "./cache";
import type { CreateMeta, EqualityComparatorCreator } from "./comparator";

const noop = function () {} as () => undefined;

const createStandardEqual = createComparatorCreator<undefined>({
  areArraysEqual,
  areMapsEqual,
  areObjectsEqual,
  areSetsEqual,
  createMeta: noop,
});

const createCircularEqual = createComparatorCreator<Cache>({
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areSetsEqual: areSetsEqualCircular,
  createMeta: getNewCache,
});

export const deepEqual = createStandardEqual();
export const shallowEqual = createStandardEqual(() => sameValueZeroEqual);

export const circularDeepEqual = createCircularEqual();
export const circularShallowEqual = createCircularEqual();

export interface CreateCustomEqualOptions<Meta = any> {
  createMeta?: CreateMeta<Meta>;
  isEqual?: EqualityComparatorCreator;
}

export function createCustomEqual(options: CreateCustomEqualOptions) {
  return createComparatorCreator<undefined>({
    areArraysEqual,
    areMapsEqual,
    areObjectsEqual,
    areSetsEqual,
    createMeta: options.createMeta || noop,
  })(options.isEqual);
}
