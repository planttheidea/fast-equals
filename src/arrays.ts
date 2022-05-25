import { createIsCircular } from "./utils";

import type { InternalEqualityComparator } from "./utils";

/* are the arrays equal in value
 *
 * @param a the array to test
 * @param b the array to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta object to pass through
 * @returns are the arrays equal
 */
export function areArraysEqual(
  a: any[],
  b: any[],
  isEqual: InternalEqualityComparator,
  meta: any
) {
  let index = a.length;

  if (b.length !== index) {
    return false;
  }

  while (index-- > 0) {
    if (!isEqual(a[index], b[index], index, index, a, b, meta)) {
      return false;
    }
  }

  return true;
}

export const areArraysEqualCircular = createIsCircular(areArraysEqual);
