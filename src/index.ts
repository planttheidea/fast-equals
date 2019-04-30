// comparator
import { createComparator } from './comparator';

// utils
import { createCircularIsEqual, sameValueZeroEqual } from './utils';

export { createComparator as createCustomEqual, sameValueZeroEqual };

export const deepEqual = createComparator();
export const shallowEqual = createComparator(() => sameValueZeroEqual);

export const circularDeepEqual = createComparator(createCircularIsEqual());
export const circularShallowEqual = createComparator(
  createCircularIsEqual(sameValueZeroEqual),
);
