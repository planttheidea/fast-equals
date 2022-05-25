import { createIsCircular } from "./utils";

import type { InternalEqualityComparator } from "./utils";

interface Dictionary<Value> {
  [key: string]: Value;
}

const OWNER = "_owner";
const { hasOwnProperty } = Object.prototype;

/**
 * are the objects equal in value
 * @param a the object to test
 * @param b the object to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the objects equal
 */
export function areObjectsEqual(
  a: Dictionary<any>,
  b: Dictionary<any>,
  isEqual: InternalEqualityComparator,
  meta: any
) {
  const keysA = Object.keys(a);

  let index = keysA.length;

  if (Object.keys(b).length !== index) {
    return false;
  }

  let key: string;

  while (index-- > 0) {
    key = keysA[index];

    if (key === OWNER) {
      const reactElementA = !!a.$$typeof;
      const reactElementB = !!b.$$typeof;

      if ((reactElementA || reactElementB) && reactElementA !== reactElementB) {
        return false;
      }
    }

    if (
      !hasOwnProperty.call(b, key) ||
      !isEqual(a[key], b[key], key, key, a, b, meta)
    ) {
      return false;
    }
  }

  return true;
}

export const areObjectsEqualCircular = createIsCircular(areObjectsEqual);
