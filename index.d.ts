import type { EqualityComparator, GetComparatorOptions } from './src/types';

export * from './src/types';

export function circularDeepEqual<A, B>(a: A, b: B): boolean;
export function circularShallowEqual<A, B>(a: A, b: B): boolean;
export function deepEqual<A, B>(a: A, b: B): boolean;
export function shallowEqual<A, B>(a: A, b: B): boolean;
export function sameValueZeroEqual<A, B>(a: A, b: B): boolean;

export function createCustomEqual<Meta = undefined>(
  getComparatorOptions: GetComparatorOptions<Meta>,
): EqualityComparator<Meta>;
export function createCustomEqual<Meta = WeakMap<any, any>>(
  getComparatorOptions: GetComparatorOptions<Meta>,
): EqualityComparator<Meta>;
