declare interface Comparator {
    (objectA, objectB): boolean;
}

declare interface Pairs {
    keys: any[];
    values: any[];
}

declare type createComparator = (createIsEqual) => Comparator;
declare type createIsSameValueZero = () => Comparator;
declare type toPairs = (iterable) => Pairs;
declare type areIterablesEqual = (objectA: any, objectB: any, comparator: Comparator, shouldCompareKeys: boolean) => boolean;

declare type fe = {
    createCustomEqual: createComparator;
    deep: Comparator;
    shallowEqual: Comparator;
}

export const createCustomEqual: createComparator;
export const deepEqual: Comparator;
export const shallowEqual: Comparator;
export default fe;