import { createComparator } from '../src/comparator';
import { areArraysEqual, areArraysEqualCircular } from '../src/arrays';
import { areDatesEqual } from '../src/dates';
import { areMapsEqual, areMapsEqualCircular } from '../src/maps';
import { areObjectsEqual, areObjectsEqualCircular } from '../src/objects';
import { areRegExpsEqual } from '../src/regexps';
import { areSetsEqual, areSetsEqualCircular } from '../src/sets';
import { createDefaultIsNestedEqual, sameValueZeroEqual } from '../src/utils';

import type { EqualityComparatorCreator } from '../src/utils';

const STANDARD_COMPARATOR_OPTIONS = {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areRegExpsEqual,
  areSetsEqual,
  createIsNestedEqual: createDefaultIsNestedEqual,
};
const CIRCULAR_COMPARATOR_OPTIONS = {
  ...STANDARD_COMPARATOR_OPTIONS,
  areArraysEqual: areArraysEqualCircular,
  areMapsEqual: areMapsEqualCircular,
  areObjectsEqual: areObjectsEqualCircular,
  areSetsEqual: areSetsEqualCircular,
};

describe('createComparator', () => {
  [
    {
      createMeta: () => {},
      name: 'standard',
      options: STANDARD_COMPARATOR_OPTIONS,
    },
    {
      createMeta: () => new WeakMap(),
      name: 'circular',
      options: CIRCULAR_COMPARATOR_OPTIONS,
    },
  ].forEach(({ createMeta, name, options }) => {
    describe(name, () => {
      it('should default to a deep-equal setup when no equality comparator is provided', () => {
        const comparator = createComparator(options);
        const meta = createMeta();

        const a = { foo: { bar: 'baz' } };
        const b = { foo: { bar: 'baz' } };

        expect(comparator(a, b, meta)).toBe(true);
      });

      it('should use the custom comparator when one is provided', () => {
        const comparator = createComparator({
          ...options,
          createIsNestedEqual: () => sameValueZeroEqual,
        });
        const meta = createMeta();

        const a = { foo: { bar: 'baz' } };
        const b = { foo: { bar: 'baz' } };

        expect(comparator(a, b, meta)).toBe(false);
      });

      it('should access Maps A and B values with keys', () => {
        const mapA = new Map([
          [{ foo: 'bar' }, 1],
          [{ foo: 'baz' }, 2],
        ]);
        const mapB = new Map([
          [{ foo: 'baz' }, 2],
          [{ foo: 'bar' }, 1],
        ]);

        const createIsNestedEqual: EqualityComparatorCreator<undefined> =
          (deepEqual) =>
          (
            a: any,
            b: any,
            indexOrKeyA: any,
            indexOrKeyB: any,
            parentA: any,
            parentB: any,
            meta: any,
          ) => {
            if (typeof a === 'number' && typeof b === 'number') {
              // Ignores key equality comparison
              expect(parentA.get(indexOrKeyA)).toBe(a);
              expect(parentB.get(indexOrKeyB)).toBe(b);
            }

            return deepEqual(a, b, meta);
          };
        const comparator = createComparator({
          ...options,
          createIsNestedEqual,
        });
        const meta = createMeta();

        comparator(mapA, mapB, meta);
      });

      it('should provide correct iteration index when comparing Map keys', () => {
        const mapA = new Map([
          ['foo', 'bar'],
          ['oof', 'baz'],
        ]);
        const mapB = new Map([
          ['oof', 'baz'],
          ['foo', 'bar'],
        ]);

        const createIsNestedEqual: EqualityComparatorCreator<undefined> =
          (deepEqual) =>
          (
            a: any,
            b: any,
            indexOrKeyA: any,
            indexOrKeyB: any,
            parentA: any,
            parentB: any,
            meta: any,
          ) => {
            if (
              typeof indexOrKeyA === 'number' &&
              typeof indexOrKeyB === 'number'
            ) {
              // Only check key equality comparison
              expect(indexOrKeyA).toBe(Array.from(parentA.keys()).indexOf(a));
              expect(indexOrKeyB).toBe(Array.from(parentB.keys()).indexOf(b));
            }

            return deepEqual(a, b, meta);
          };
        const comparator = createComparator({
          ...options,
          createIsNestedEqual,
        });
        const meta = createMeta();

        comparator(mapA, mapB, meta);
      });
    });
  });

  describe('custom', () => {
    it('should call the custom comparator with the correct params', () => {
      const customComparatorMock = jest.fn();
      const createIsNestedEqual: EqualityComparatorCreator<undefined> =
        (deepEqual) =>
        (
          ...args: [
            a: any,
            b: any,
            indexOrKeyA: any,
            indexOrKeyB: any,
            parentA: any,
            parentB: any,
            meta: any,
          ]
        ) => {
          customComparatorMock(...args);
          const [a, b, , , , , meta] = args;
          return deepEqual(a, b, meta);
        };
      const comparator = createComparator({
        ...STANDARD_COMPARATOR_OPTIONS,
        createIsNestedEqual,
      });

      const a = {
        foo: {
          bar: ['1', '2'],
          baz: new Set().add('x'),
          oof: new Map().set('y', 'yes'),
        },
      };
      const b = {
        foo: {
          bar: ['1', '2'],
          baz: new Set().add('x'),
          oof: new Map().set('y', 'yes'),
        },
      };

      const expectedParams: any = [
        [a.foo, b.foo, 'foo', 'foo', a, b, 'META'],
        [a.foo.oof, b.foo.oof, 'oof', 'oof', a.foo, b.foo, 'META'],
        ['y', 'y', 0, 0, a.foo.oof, b.foo.oof, 'META'], // called with the keys of a Map
        [
          a.foo.oof.get('y'),
          b.foo.oof.get('y'),
          'y',
          'y',
          a.foo.oof,
          b.foo.oof,
          'META',
        ],
        [a.foo.baz, b.foo.baz, 'baz', 'baz', a.foo, b.foo, 'META'],
        ['x', 'x', 'x', 'x', a.foo.baz, b.foo.baz, 'META'],
        [a.foo.bar, b.foo.bar, 'bar', 'bar', a.foo, b.foo, 'META'],
        [a.foo.bar[1], b.foo.bar[1], 1, 1, a.foo.bar, b.foo.bar, 'META'],
        [a.foo.bar[0], b.foo.bar[0], 0, 0, a.foo.bar, b.foo.bar, 'META'],
      ];

      comparator(a, b, 'META');
      expect(customComparatorMock.mock.calls).toEqual(expectedParams);
    });
  });
});
