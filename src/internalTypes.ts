export interface Cache<Key extends object, Value> {
  delete(key: Key): boolean;
  get(key: Key): Value | undefined;
  set(key: Key, value: any): any;
}

export interface State<Meta> {
  readonly cache: Cache<any, any> | undefined;
  readonly equals: InternalEqualityComparator<Meta>;
  meta: Meta;
  readonly strict: boolean;
}

export interface CircularState<Meta> extends State<Meta> {
  readonly cache: Cache<any, any>;
}

export interface DefaultState<Meta> extends State<Meta> {
  readonly cache: undefined;
}

export interface Dictionary<Value = any> {
  [key: string | symbol]: Value;
  $$typeof?: any;
}

export interface ComparatorConfig<Meta> {
  areArraysEqual: TypeEqualityComparator<any, Meta>;
  areDatesEqual: TypeEqualityComparator<any, Meta>;
  areMapsEqual: TypeEqualityComparator<any, Meta>;
  areObjectsEqual: TypeEqualityComparator<any, Meta>;
  arePrimitiveWrappersEqual: TypeEqualityComparator<any, Meta>;
  areRegExpsEqual: TypeEqualityComparator<any, Meta>;
  areSetsEqual: TypeEqualityComparator<any, Meta>;
  areTypedArraysEqual: TypeEqualityComparator<any, Meta>;
}

export type CreateCustomComparatorConfig<Meta> = (
  config: ComparatorConfig<Meta>,
) => Partial<ComparatorConfig<Meta>>;

export type CreateState<Meta> = () => {
  cache?: Cache<any, any> | undefined;
  meta?: Meta;
};

export type EqualityComparator<Meta> = <A, B>(
  a: A,
  b: B,
  state: State<Meta>,
) => boolean;
export type AnyEqualityComparator<Meta> = (
  a: any,
  b: any,
  state: State<Meta>,
) => boolean;

export type EqualityComparatorCreator<Meta> = (
  fn: EqualityComparator<Meta>,
) => InternalEqualityComparator<Meta>;

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
// eslint-disable-next-line @typescript-eslint/ban-types
export type PrimitiveWrapper = Boolean | Number | String;

export type TypedArray =
  | Float32Array
  | Float64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Uint16Array
  | Uint32Array
  | Uint8Array
  | Uint8ClampedArray;

export type TypeEqualityComparator<Type, Meta = undefined> = (
  a: Type,
  b: Type,
  state: State<Meta>,
) => boolean;

export interface CustomEqualCreatorOptions<Meta> {
  circular?: boolean;
  createCustomConfig?: CreateCustomComparatorConfig<Meta>;
  createInternalComparator?: (
    compare: EqualityComparator<Meta>,
  ) => InternalEqualityComparator<Meta>;
  createState?: CreateState<Meta>;
  strict?: boolean;
}
