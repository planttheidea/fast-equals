import { createComparator } from './comparator';
import { createCircularEqualCreator, sameValueZeroEqual } from './utils';

export { createComparator as createCustomEqual, sameValueZeroEqual };

export const deepEqual = createComparator();
export const shallowEqual = createComparator(() => sameValueZeroEqual);

export const circularDeepEqual = createComparator(createCircularEqualCreator());
export const circularShallowEqual = createComparator(
  createCircularEqualCreator(sameValueZeroEqual),
);
