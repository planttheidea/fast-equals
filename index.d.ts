import type { CreateComparatorCreatorOptions } from './src/comparator';
import type { EqualityComparator } from './src/utils';

export type { CreateComparatorCreatorOptions } from './src/comparator';
export type {
  EqualityComparator,
  EqualityComparatorCreator,
  InternalEqualityComparator,
  NativeEqualityComparator,
} from './src/utils';

export function circularDeepEqual<A, B>(a: A, b: B): boolean;
export function circularShallowEqual<A, B>(a: A, b: B): boolean;
export function createCustomEqual(
  createCustomEqualOptions: CreateComparatorCreatorOptions,
): EqualityComparator;
export function createCustomCircularEqual(
  createCustomCircularEqualOptions: CreateComparatorCreatorOptions,
): EqualityComparator;
export function deepEqual<A, B>(a: A, b: B): boolean;
export function shallowEqual<A, B>(a: A, b: B): boolean;
export function sameValueZeroEqual<A, B>(a: A, b: B): boolean;
