declare type EqualityComparator = (
  objectA: any,
  objectB: any,
  meta?: any,
) => boolean;
declare type InternalEqualityComparator = (
  objectA: any,
  objectB: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  meta: any,
) => boolean;
declare type EqualityComparatorCreator = (
  comparator: EqualityComparator,
) => InternalEqualityComparator;

export declare function createCustomEqual(
  createIsEqual?: EqualityComparatorCreator,
): EqualityComparator;
export declare function circularDeepEqual<A, B>(objectA: A, objectB: B): boolean;
export declare function circularShallowEqual<A, B>(objectA: A, objectB: B): boolean;
export declare function deepEqual<A, B>(objectA: A, objectB: B): boolean;
export declare function shallowEqual<A, B>(objectA: A, objectB: B): boolean;
export declare function sameValueZeroEqual<A, B>(objectA: A, objectB: B): boolean;
