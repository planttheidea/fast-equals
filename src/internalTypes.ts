export interface BaseCircularMeta
  extends Pick<WeakMap<any, any>, 'delete' | 'get'> {
  set(key: object, value: any): any;
}

export interface DefaultCache {
  [key: string]: any;

  readonly __c: undefined;
  readonly compare: InternalEqualityComparator;
  readonly strict: boolean;
}

export interface CircularCache {
  [key: string]: any;

  readonly __c: WeakMap<any, any>;
  readonly compare: InternalEqualityComparator;
  readonly strict: boolean;
}

export type Cache = CircularCache | DefaultCache;

export interface CreateComparatorCreatorOptions {
  areArraysEqual: TypeEqualityComparator<any[]>;
  areDatesEqual: TypeEqualityComparator<Date>;
  areMapsEqual: TypeEqualityComparator<Map<any, any>>;
  areObjectsEqual: TypeEqualityComparator<Dictionary>;
  areRegExpsEqual: TypeEqualityComparator<RegExp>;
  areSetsEqual: TypeEqualityComparator<Set<any>>;
  createIsNestedEqual: EqualityComparatorCreator;
}

export type EqualityComparator = <A, B>(a: A, b: B, cache: Cache) => boolean;

export type EqualityComparatorCreator = (
  fn: EqualityComparator,
) => InternalEqualityComparator;

export interface Dictionary<Value = any> {
  [key: string | symbol]: Value;
  $$typeof?: any;
}

export type InternalEqualityComparator = (
  a: any,
  b: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  cache: Cache,
) => boolean;

export type TypeEqualityComparator<Type> = (
  a: Type,
  b: Type,
  cache: Cache,
) => boolean;
