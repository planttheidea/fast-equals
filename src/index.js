// comparator
import createCustomEqual from './comparator';

// utils
import {sameValueZeroEqual} from './utils';

export {createCustomEqual, sameValueZeroEqual};

export const deepEqual = createCustomEqual();
export const shallowEqual = createCustomEqual(() => sameValueZeroEqual);

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  sameValueZero: sameValueZeroEqual,
  shallow: shallowEqual
};
