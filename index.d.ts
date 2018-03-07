declare type Comparator = (objectA: any, objectB: any) => boolean;

export declare function createCustomEqual(createIsEqual?: Comparator): Comparator;
export declare function deepEqual(objectA: any, objectB: any): boolean;
export declare function shallowEqual(objectA: any, objectB: any): boolean;
export declare function sameValueZeroEqual(objectA: any, objectB: any): boolean;

type module = {
    createCustom: typeof createCustomEqual,
    deep: typeof deepEqual,
    shallow: typeof shallowEqual,
    sameValueZero: typeof sameValueZeroEqual,
};

export default module;
