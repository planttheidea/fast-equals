// comparator
import createCustomEqual from './comparator';

// utils
import {
  createCircularEqual,
  sameValueZeroEqual
} from './utils';

export {
  createCustomEqual, sameValueZeroEqual
};

export const circularDeepEqual = createCustomEqual(createCircularEqual());
export const circularShallowEqual = createCustomEqual(createCircularEqual(sameValueZeroEqual));
export const deepEqual = createCustomEqual();
export const shallowEqual = createCustomEqual(() => sameValueZeroEqual);

export default {
  circularDeep: circularDeepEqual,
  circularShallow: circularShallowEqual,
  createCustom: createCustomEqual,
  deep: deepEqual,
  sameValueZero: sameValueZeroEqual,
  shallow: shallowEqual,
};
