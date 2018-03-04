// comparator
import createComparator from './comparator';

// utils
import {createIsSameValueZero} from './utils';

export const createCustomEqual = createComparator;

export const deepEqual = createComparator();
export const sameValueZeroEqual = createIsSameValueZero();
export const shallowEqual = createComparator(createIsSameValueZero);

export default {
  createCustom: createCustomEqual,
  deep: deepEqual,
  sameValueZero: sameValueZeroEqual,
  shallow: shallowEqual
};
