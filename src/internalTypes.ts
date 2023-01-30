export interface BaseCircular
  extends Pick<WeakMap<any, any>, 'delete' | 'get'> {
  set(key: object, value: any): any;
}

export type State<Meta> = CircularState<Meta> | DefaultState<Meta>;

export interface CircularState<Meta> {
  readonly cache: BaseCircular;
  readonly equals: InternalEqualityComparator<Meta>;
  meta: Meta;
  readonly strict: boolean;
}

export interface DefaultState<Meta> {
  readonly cache: undefined;
  readonly equals: InternalEqualityComparator<Meta>;
  meta: Meta;
  readonly strict: boolean;
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
  areRegExpsEqual: TypeEqualityComparator<any, Meta>;
  areSetsEqual: TypeEqualityComparator<any, Meta>;
}

export type CreateCustomComparatorConfig<Meta> = (
  config: ComparatorConfig<Meta>,
) => Partial<ComparatorConfig<Meta>>;

export type CreateState<Meta> = (
  comparator: EqualityComparator<Meta>,
) => Partial<State<Meta>>;

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

export type TypeEqualityComparator<Type, Meta = undefined> = (
  a: Type,
  b: Type,
  state: State<Meta>,
) => boolean;
