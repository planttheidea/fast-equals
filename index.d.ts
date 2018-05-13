declare type Comparator = (objectA: any, objectB: any, meta: any) => boolean;

export declare function createCustomEqual(createIsEqual?: Comparator): Comparator;
export declare function circularDeepEqual(objectA: any, objectB: any): boolean;
export declare function circularShallowEqual(objectA: any, objectB: any): boolean;
export declare function deepEqual(objectA: any, objectB: any): boolean;
export declare function shallowEqual(objectA: any, objectB: any): boolean;
export declare function sameValueZeroEqual(objectA: any, objectB: any): boolean;

type module = {
  circularDeep: typeof circularDeepEqual;
  circularShallow: typeof circularShallowEqual;
  createCustom: typeof createCustomEqual;
  deep: typeof deepEqual;
  shallow: typeof shallowEqual;
  sameValueZero: typeof sameValueZeroEqual;
};

export default module;
