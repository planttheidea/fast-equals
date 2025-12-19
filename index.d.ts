/**
 * Cache used to store references to objects, used for circular
 * reference checks.
 */
interface Cache<Key extends object, Value> {
    delete(key: Key): boolean;
    get(key: Key): Value | undefined;
    set(key: Key, value: any): any;
}
interface State<Meta> {
    /**
     * Cache used to identify circular references
     */
    readonly cache: Cache<any, any> | undefined;
    /**
     * Method used to determine equality of nested value.
     */
    readonly equals: InternalEqualityComparator<Meta>;
    /**
     * Additional value that can be used for comparisons.
     */
    meta: Meta;
    /**
     * Whether the equality comparison is strict, meaning it matches
     * all properties (including symbols and non-enumerable properties)
     * with equal shape of descriptors.
     */
    readonly strict: boolean;
}
interface ComparatorConfig<Meta> {
    /**
     * Whether the array buffers passed are equal in value. In strict mode, this includes
     * additional properties added to the array.
     */
    areArrayBuffersEqual: EqualityComparator<Meta>;
    /**
     * Whether the arrays passed are equal in value. In strict mode, this includes
     * additional properties added to the array.
     */
    areArraysEqual: EqualityComparator<Meta>;
    /**
     * Whether the data views passed are equal in value.
     */
    areDataViewsEqual: EqualityComparator<Meta>;
    /**
     * Whether the dates passed are equal in value.
     */
    areDatesEqual: EqualityComparator<Meta>;
    /**
     * Whether the errors passed are equal in value.
     */
    areErrorsEqual: EqualityComparator<Meta>;
    /**
     * Whether the functions passed are equal in value.
     */
    areFunctionsEqual: EqualityComparator<Meta>;
    /**
     * Whether the maps passed are equal in value. In strict mode, this includes
     * additional properties added to the map.
     */
    areMapsEqual: EqualityComparator<Meta>;
    /**
     * Whether the numbers passed are equal in value.
     */
    areNumbersEqual: EqualityComparator<Meta>;
    /**
     * Whether the objects passed are equal in value. In strict mode, this includes
     * non-enumerable properties added to the map, as well as symbol properties.
     */
    areObjectsEqual: EqualityComparator<Meta>;
    /**
     * Whether the primitive wrappers passed are equal in value.
     */
    arePrimitiveWrappersEqual: EqualityComparator<Meta>;
    /**
     * Whether the regexps passed are equal in value.
     */
    areRegExpsEqual: EqualityComparator<Meta>;
    /**
     * Whether the sets passed are equal in value. In strict mode, this includes
     * additional properties added to the set.
     */
    areSetsEqual: EqualityComparator<Meta>;
    /**
     * Whether the typed arrays passed are equal in value. In strict mode, this includes
     * additional properties added to the typed array.
     */
    areTypedArraysEqual: EqualityComparator<Meta>;
    /**
     * Whether the URLs passed are equal in value.
     */
    areUrlsEqual: EqualityComparator<Meta>;
    /**
     * Get a custom comparator based on the objects passed.
     */
    getUnsupportedCustomComparator: ((a: any, b: any, state: State<Meta>, tag: string) => EqualityComparator<Meta> | undefined) | undefined;
}
type EqualityComparator<Meta> = (a: any, b: any, state: State<Meta>) => boolean;
type InternalEqualityComparator<Meta> = (a: any, b: any, indexOrKeyA: any, indexOrKeyB: any, parentA: any, parentB: any, state: State<Meta>) => boolean;
type PrimitiveWrapper = Boolean | Number | String;
/**
 * Type which encompasses possible instances of TypedArray
 * classes.
 */
type TypedArray = BigInt64Array | BigUint64Array | Float32Array | Float64Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array | Uint8Array | Uint8ClampedArray;
interface CustomEqualCreatorOptions<Meta> {
    /**
     * Whether circular references should be supported. It causes the
     * comparison to be slower, but for objects that have circular references
     * it is required to avoid stack overflows.
     */
    circular?: boolean;
    /**
     * Create a custom configuration of type-specific equality comparators.
     * This receives the default configuration, which allows either replacement
     * or a superset of the default methods.
     */
    createCustomConfig?: (config: ComparatorConfig<Meta>) => Partial<ComparatorConfig<Meta>>;
    /**
     * Create a custom internal comparator, which is used as an override to the
     * default entry point for nested value equality comparisons. This is often
     * used for doing custom logic for specific types (such as handling a specific
     * class instance differently than other objects) or to incorporate `meta` in
     * the comparison. See the recipes for examples.
     */
    createInternalComparator?: (compare: EqualityComparator<Meta>) => InternalEqualityComparator<Meta>;
    /**
     * Create a custom `state` object passed between the methods. This allows for
     * custom `cache` and/or `meta` values to be used.
     */
    createState?: () => {
        cache?: Cache<any, any> | undefined;
        meta?: Meta;
    };
    /**
     * Whether the equality comparison is strict, meaning it matches
     * all properties (including symbols and non-enumerable properties)
     * with equal shape of descriptors.
     */
    strict?: boolean;
}

/**
 * Whether the values passed are equal based on a [SameValue](https://262.ecma-international.org/7.0/#sec-samevalue) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`) or both are `NaN`.
 *
 * @note
 * When available in the environment, this is just a re-export of the global
 * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) method.
 */
declare const sameValueEqual: (value1: any, value2: any) => boolean;
/**
 * Whether the values passed are equal based on a [SameValue](https://262.ecma-international.org/7.0/#sec-samevaluezero) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`), both are `NaN`, or both
 * are either positive or negative zero.
 */
declare function sameValueZeroEqual(a: any, b: any): boolean;
/**
 * Whether the values passed are equal based on a
 * [Strict Equality Comparison](https://262.ecma-international.org/7.0/#sec-strict-equality-comparison) basis.
 * Simplified, this maps to if the two values are referentially equal to one another (`a === b`).
 *
 * @note
 * This is mainly available as a convenience function, such as being a default when a function to determine equality between
 * two objects is used.
 */
declare function strictEqual(a: any, b: any): boolean;

/**
 * Whether the items passed are deeply-equal in value.
 */
declare const deepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value based on strict comparison.
 */
declare const strictDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
declare const circularDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are deeply-equal in value, including circular references,
 * based on strict comparison.
 */
declare const strictCircularDeepEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value.
 */
declare const shallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value based on strict comparison
 */
declare const strictShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
declare const circularShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Whether the items passed are shallowly-equal in value, including circular references,
 * based on strict comparison.
 */
declare const strictCircularShallowEqual: <A, B>(a: A, b: B) => boolean;
/**
 * Create a custom equality comparison method.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `RegExp.prototype.flags` out of the box.
 */
declare function createCustomEqual<Meta = undefined>(options?: CustomEqualCreatorOptions<Meta>): <A, B>(a: A, b: B) => boolean;

export { circularDeepEqual, circularShallowEqual, createCustomEqual, deepEqual, sameValueEqual, sameValueZeroEqual, shallowEqual, strictCircularDeepEqual, strictCircularShallowEqual, strictDeepEqual, strictEqual, strictShallowEqual };
export type { Cache, ComparatorConfig, CustomEqualCreatorOptions, EqualityComparator, InternalEqualityComparator, PrimitiveWrapper, State, TypedArray };
