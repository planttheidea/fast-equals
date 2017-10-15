// comparator
import createComparator from './comparator';

// utils
import {createIsStrictlyEqual} from './utils';

export const createCustomEqual = createComparator;

export const deepEqual = createComparator();
export const shallowEqual = createComparator(createIsStrictlyEqual);

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  shallow: shallowEqual
};
