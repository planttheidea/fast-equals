import type { CreateComparatorCreatorOptions } from './src/comparator';
import type { EqualityComparator } from './src/utils';

export type { CreateComparatorCreatorOptions } from './src/comparator';
export type {
  EqualityComparator,
  EqualityComparatorCreator,
  InternalEqualityComparator,
  NativeEqualityComparator,
} from './src/utils';

export function createCustomEqual(
  createCustomEqualOptions: CreateComparatorCreatorOptions,
): EqualityComparator;
export function circularDeepEqual<A, B>(objectA: A, objectB: B): boolean;
export function circularShallowEqual<A, B>(objectA: A, objectB: B): boolean;
export function deepEqual<A, B>(objectA: A, objectB: B): boolean;
export function shallowEqual<A, B>(objectA: A, objectB: B): boolean;
export function sameValueZeroEqual<A, B>(objectA: A, objectB: B): boolean;
