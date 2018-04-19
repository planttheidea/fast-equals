// comparator
import createCustomEqual from './comparator';

// utils
import {createIsSameValueZero} from './utils';

export {createCustomEqual};

export const deepEqual = createCustomEqual();
export const sameValueZeroEqual = createIsSameValueZero();
export const shallowEqual = createCustomEqual(createIsSameValueZero);

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  sameValueZero: sameValueZeroEqual,
  shallow: shallowEqual
};
