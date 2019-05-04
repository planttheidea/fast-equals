declare type EqualityComparator = (
  objectA: any,
  objectB: any,
  meta?: any,
) => boolean;
declare type EqualityComparatorCreator = (
  comparator: EqualityComparator,
) => EqualityComparator;

export declare function createCustomEqual(
  createIsEqual?: EqualityComparatorCreator,
): EqualityComparator;
export declare function circularDeepEqual(objectA: any, objectB: any): boolean;
export declare function circularShallowEqual(
  objectA: any,
  objectB: any,
): boolean;
export declare function deepEqual(objectA: any, objectB: any): boolean;
export declare function shallowEqual(objectA: any, objectB: any): boolean;
export declare function sameValueZeroEqual(objectA: any, objectB: any): boolean;
