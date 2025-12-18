/**
 * Cache used to store references to objects, used for circular
 * reference checks.
 */
export interface Cache<Key extends object, Value> {
  delete(key: Key): boolean;
  get(key: Key): Value | undefined;
  set(key: Key, value: any): any;
}

export interface State<Meta> {
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

export interface CircularState<Meta> extends State<Meta> {
  readonly cache: Cache<any, any>;
}

export type AnyObject = Record<number | string | symbol, any>;

export interface ComparatorConfig<Meta> {
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
  getUnsupportedCustomComparator: ((a: any, b: any, tag: string) => EqualityComparator<Meta> | undefined) | undefined;
}

export type EqualityComparator<Meta> = (a: any, b: any, state: State<Meta>) => boolean;

export type InternalEqualityComparator<Meta> = (
  a: any,
  b: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  state: State<Meta>,
) => boolean;

// We explicitly check for primitive wrapper types
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export type PrimitiveWrapper = Boolean | Number | String;

/**
 * Type which encompasses possible instances of TypedArray
 * classes.
 */
export type TypedArray =
  | BigInt64Array
  | BigUint64Array
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint16Array
  | Uint32Array
  | Uint8Array
  | Uint8ClampedArray;

export interface CustomEqualCreatorOptions<Meta> {
  /**
   * Whether circular references should be supported. It causes the
   * comparison to be slower, but for objects that have circular references
   * it is required to avoid stack overflows.
   */
  circular?: boolean;
  /**
   * Create a custom configuration of type-specific equality comparators.
   * This receives the default configuration, which allows either replacement
   * or supersetting of the default methods.
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
