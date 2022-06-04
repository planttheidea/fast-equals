import type {
  circularDeepEqual as CircularDeepEqual,
  circularShallowEqual as CircularShallowEqual,
  createCustomEqual as CreateCustomEqual,
  createCustomCircularEqual as CreateCustomCircularEqual,
  deepEqual as DeepEqual,
  shallowEqual as ShallowEqual,
  sameValueZeroEqual as SameValueZeroEqual,
} from './src/index';

export type { BaseCircularMeta, GetComparatorOptions } from './src/index';
export type { CreateComparatorCreatorOptions } from './src/comparator';
export type {
  EqualityComparator,
  EqualityComparatorCreator,
  InternalEqualityComparator,
  NativeEqualityComparator,
  TypeEqualityComparator,
} from './src/utils';

export const circularDeepEqual: typeof CircularDeepEqual;
export const circularShallowEqual: typeof CircularShallowEqual;
export const createCustomEqual: typeof CreateCustomEqual;
export const createCustomCircularEqual: typeof CreateCustomCircularEqual;
export const deepEqual: typeof DeepEqual;
export const shallowEqual: typeof ShallowEqual;
export const sameValueZeroEqual: typeof SameValueZeroEqual;
