import { createIsCircular } from "./utils";

import type { InternalEqualityComparator } from "./utils";

/**
 * are the maps equal in value
 *
 * @param a the map to test
 * @param b the map to test against
 * @param isEqual the comparator to determine equality
 * @param meta the meta map to pass through
 * @returns are the maps equal
 */
export function areMapsEqual(
  a: Map<any, any>,
  b: Map<any, any>,
  isEqual: InternalEqualityComparator,
  meta: any
) {
  let isValueEqual = a.size === b.size;

  if (!isValueEqual) {
    return false;
  }

  if (!a.size) {
    return true;
  }

  const matchedIndices: Record<number, true> = {};

  let indexA = 0;

  a.forEach((aValue, aKey) => {
    if (isValueEqual) {
      let hasMatch = false;
      let matchIndexB = 0;

      b.forEach((bValue, bKey) => {
        if (
          !hasMatch &&
          !matchedIndices[matchIndexB] &&
          (hasMatch =
            isEqual(aKey, bKey, indexA, matchIndexB, a, b, meta) &&
            isEqual(aValue, bValue, aKey, bKey, a, b, meta))
        ) {
          matchedIndices[matchIndexB] = true;
        }

        matchIndexB++;
      });

      indexA++;
      isValueEqual = hasMatch;
    }
  });

  return isValueEqual;
}

export const areMapsEqualCircular = createIsCircular(areMapsEqual);
