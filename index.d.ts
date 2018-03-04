declare type Comparator = (objectA, objectB) => boolean;

export declare function createCustomEqual(createIsEqual?: Comparator): Comparator;
export declare function deepEqual(objectA, objectB): boolean;
export declare function sameValueZeroEqual(objectA, objectB): boolean;
export declare function shallowEqual(objectA, objectB): boolean;

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  sameValueZero: sameValueZeroEqual,
  shallow: shallowEqual
};
