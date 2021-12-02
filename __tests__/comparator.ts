/* globals afterEach,beforeEach,describe,expect,it,jest */

import { createComparator } from '../src/comparator';
import type { EqualityComparatorCreator } from '../src/comparator';

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

  it('should use the custom comparator when one is provided', () => {
    const createIsEqual = () => (a: any, b: any) => a === b;

    const comparator = createComparator(createIsEqual);

    const a = { foo: { bar: 'baz' } };
    const b = { foo: { bar: 'baz' } };

    expect(comparator(a, b)).toBe(false);
  });

  it('should call the custom comparator with the correct params', () => {
    const customComparatorMock = jest.fn();
    const createIsEqual: EqualityComparatorCreator = (deepEqual) => (a: any, b: any, meta?: any, indexOrKey?: any, parentA?: any, parentB?: any) => {
      customComparatorMock(a, b, meta, indexOrKey, parentA, parentB);
      return deepEqual(a, b, meta);
    };
    const comparator = createComparator(createIsEqual);

    const a = { foo: { bar: ['1', '2'], baz: new Set().add('x'), oof: new Map().set('y', 'yes') } };
    const b = { foo: { bar: ['1', '2'], baz: new Set().add('x'), oof: new Map().set('y', 'yes') } };

    const expectedParams: any = [
      [a.foo, b.foo, 'META', 'foo', a, b],
      [a.foo.oof, b.foo.oof, 'META', 'oof', a.foo, b.foo],
      ['y', 'y', 'META', undefined, a.foo.oof, b.foo.oof], // called with the keys of a Map
      [a.foo.oof.get('y'), b.foo.oof.get('y'), 'META', 'y', a.foo.oof, b.foo.oof],
      [a.foo.baz, b.foo.baz, 'META', 'baz', a.foo, b.foo],
      ['x', 'x', 'META', undefined, a.foo.baz, b.foo.baz],
      [a.foo.bar, b.foo.bar, 'META', 'bar', a.foo, b.foo],
      [a.foo.bar[1], b.foo.bar[1], 'META', 1, a.foo.bar, b.foo.bar],
      [a.foo.bar[0], b.foo.bar[0], 'META', 0, a.foo.bar, b.foo.bar],
    ];

    comparator(a, b, 'META');
    expect(customComparatorMock.mock.calls).toEqual(expectedParams);
  });
});
