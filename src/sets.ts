import { createIsCircular } from './utils';

import type { InternalEqualityComparator } from './utils';

/**
 * are the sets equal in value
 *
 * @param a the set to test
 * @param b the set to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta set to pass through
 * @returns are the sets equal
 */
export function areSetsEqual(
  a: Set<any>,
  b: Set<any>,
  isEqual: InternalEqualityComparator,
  meta: any,
) {
  let isValueEqual = a.size === b.size;

  if (!isValueEqual) {
    return false;
  }

  if (!a.size) {
    return true;
  }

  const matchedIndices: Record<number, true> = {};

  a.forEach((aValue, aKey) => {
    if (isValueEqual) {
      let hasMatch = false;
      let matchIndex = 0;

      b.forEach((bValue, bKey) => {
        if (
          !hasMatch &&
          !matchedIndices[matchIndex] &&
          (hasMatch = isEqual(aValue, bValue, aKey, bKey, a, b, meta))
        ) {
          matchedIndices[matchIndex] = true;
        }

        matchIndex++;
      });

      isValueEqual = hasMatch;
    }
  });

  return isValueEqual;
}

export const areSetsEqualCircular = createIsCircular(areSetsEqual);
