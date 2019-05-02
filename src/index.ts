// comparator
import { createComparator } from './comparator';

// utils
import { createCircularIsEqualCreator, sameValueZeroEqual } from './utils';

export { createComparator as createCustomEqual, sameValueZeroEqual };

export const deepEqual = createComparator();
export const shallowEqual = createComparator(() => sameValueZeroEqual);

export const circularDeepEqual = createComparator(
  createCircularIsEqualCreator(),
);
export const circularShallowEqual = createComparator(
  createCircularIsEqualCreator(sameValueZeroEqual),
);
