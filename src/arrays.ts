import { createIsCircular } from './utils';

import type { InternalEqualityComparator } from './utils';

/**
 * Whether the arrays are equal in value.
 */
export function areArraysEqual(
  a: any[],
  b: any[],
  isEqual: InternalEqualityComparator,
  meta: any,
) {
  let index = a.length;

  if (b.length !== index) {
    return false;
  }

  // Decrementing `while` showed faster results than either incrementing or
  // decrementing `for` loop and than an incrementing `while` loop. Declarative
  // methods like `some` / `every` were not used to avoid incurring the garbage
  // cost of anonymous callbacks.
  while (index-- > 0) {
    if (!isEqual(a[index], b[index], index, index, a, b, meta)) {
      return false;
    }
  }

  return true;
}

/**
 * Whether the arrays are equal in value, including circular references.
 */
export const areArraysEqualCircular = createIsCircular(areArraysEqual);
