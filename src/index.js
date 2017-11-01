// comparator
import createComparator from './comparator';

// utils
import {createIsSameValueZero} from './utils';

export const createCustomEqual = createComparator;

export const deepEqual = createComparator();
export const shallowEqual = createComparator(createIsSameValueZero);

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  shallow: shallowEqual
};
