export type Primitive = bigint | boolean | number | string | symbol;

export type InternalEqualityComparator = (
  objectA: any,
  objectB: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  meta: any,
) => boolean;

export type EqualityComparator = <A, B, Meta>(
  objectA: A,
  objectB: B,
  meta?: Meta,
) => boolean;
