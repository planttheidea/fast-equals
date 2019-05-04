/* globals afterEach,beforeEach,describe,expect,it,jest */

import { createComparator } from '../src/comparator';

describe('createComparator', () => {
  it('should return a function', () => {
    const comparator = createComparator();

    expect(typeof comparator).toBe('function');
  });

  it('should default to a deep-equal setup when no equality comparator is provided', () => {
    const comparator = createComparator();

    const a = { foo: { bar: 'baz' } };
    const b = { foo: { bar: 'baz' } };

    expect(comparator(a, b)).toBe(true);
  });

  it('should use the custom setup when an equality comparator is provided', () => {
    const createIsEqual = () => (a: any, b: any) => a === b;

    const comparator = createComparator(createIsEqual);

    const a = { foo: { bar: 'baz' } };
    const b = { foo: { bar: 'baz' } };

    expect(comparator(a, b)).toBe(false);
  });
});
