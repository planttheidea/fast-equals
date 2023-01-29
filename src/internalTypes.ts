export interface BaseCircularMeta
  extends Pick<WeakMap<any, any>, 'delete' | 'get'> {
  set(key: object, value: any): any;
}

export interface Cache<Meta = any> {
  compare: InternalEqualityComparator<Meta>;
  meta: Meta;
  strict: boolean;
}

export interface CreateComparatorCreatorOptions<Meta> {
  areArraysEqual: TypeEqualityComparator<any, Meta>;
  areDatesEqual: TypeEqualityComparator<any, Meta>;
  areMapsEqual: TypeEqualityComparator<any, Meta>;
  areObjectsEqual: TypeEqualityComparator<any, Meta>;
  areRegExpsEqual: TypeEqualityComparator<any, Meta>;
  areSetsEqual: TypeEqualityComparator<any, Meta>;
  createIsNestedEqual: EqualityComparatorCreator<Meta>;
}

export type EqualityComparator<Meta> = <A, B>(
  a: A,
  b: B,
  cache: Cache<Meta>,
) => boolean;

export type EqualityComparatorCreator<Meta> = (
  fn: EqualityComparator<Meta>,
) => InternalEqualityComparator<Meta>;

export interface Dictionary<Value = any> {
  [key: string | symbol]: Value;
  $$typeof?: any;
}

export type InternalEqualityComparator<Meta> = (
  a: any,
  b: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  cache: Cache<Meta>,
) => boolean;

export type TypeEqualityComparator<Type, Meta> = (
  a: Type,
  b: Type,
  cache: Cache<Meta>,
) => boolean;
