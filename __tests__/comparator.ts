import {
  createEqualityComparator,
  createInternalEqualityComparator,
} from '../src/comparator';
import {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
  areTypedArraysEqual,
} from '../src/equals';
import { createIsCircular } from '../src/utils';

import type { InternalEqualityComparator, State } from '../src/internalTypes';

const STANDARD_COMPARATOR_OPTIONS = {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
  areTypedArraysEqual,
  unknownTagComparators: {},
};
const CIRCULAR_COMPARATOR_OPTIONS = {
  ...STANDARD_COMPARATOR_OPTIONS,
  areArraysEqual: createIsCircular(areArraysEqual),
  areMapsEqual: createIsCircular(areMapsEqual),
  areObjectsEqual: createIsCircular(areObjectsEqual),
  areSetsEqual: createIsCircular(areSetsEqual),
};

describe('createEqualityComparator', () => {
  [
    {
      createState: <Meta>(
        equals: InternalEqualityComparator<undefined>,
        meta?: Meta,
      ) => ({
        cache: undefined,
        equals,
        meta,
        strict: false,
      }),
      name: 'standard',
      options: STANDARD_COMPARATOR_OPTIONS,
    },
    {
      createState: <Meta>(
        equals: InternalEqualityComparator<undefined>,
        meta?: Meta,
      ) => ({
        cache: new WeakMap(),
        equals,
        meta: meta,
        strict: false,
      }),
      name: 'circular',
      options: CIRCULAR_COMPARATOR_OPTIONS,
    },
  ].forEach(({ createState, name, options }) => {
    describe(name, () => {
      it('should default to a deep-equal setup when no equality comparator is provided', () => {
        const comparator = createEqualityComparator(options);
        const meta = createState(createInternalEqualityComparator(comparator));

        const a = { foo: { bar: 'baz' } };
        const b = { foo: { bar: 'baz' } };

        expect(comparator(a, b, meta)).toBe(true);
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

        const comparator = createEqualityComparator(options);
        const state = createState(
          (
            a: any,
            b: any,
            indexOrKeyA: any,
            indexOrKeyB: any,
            parentA: any,
            parentB: any,
            state: State<undefined>,
          ) => {
            if (
              typeof indexOrKeyA === 'number' &&
              typeof indexOrKeyB === 'number'
            ) {
              // Only check key equality comparison
              expect(indexOrKeyA).toBe(Array.from(parentA.keys()).indexOf(a));
              expect(indexOrKeyB).toBe(Array.from(parentB.keys()).indexOf(b));
            }

            return comparator(a, b, state);
          },
        );

        comparator(mapA, mapB, state);
      });
    });
  });

  describe('custom', () => {
    it('should call the custom comparator with the correct params', () => {
      const customComparatorMock = jest.fn();
      const comparator = createEqualityComparator(STANDARD_COMPARATOR_OPTIONS);
      const state: State<'META'> = {
        cache: undefined,
        equals(...args) {
          customComparatorMock(...args);
          const [a, b, , , , , meta] = args;
          return comparator(a, b, meta);
        },
        meta: 'META',
        strict: false,
      };

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
        [a.foo, b.foo, 'foo', 'foo', a, b, state],
        [a.foo.oof, b.foo.oof, 'oof', 'oof', a.foo, b.foo, state],
        ['y', 'y', 0, 0, a.foo.oof, b.foo.oof, state], // called with the keys of a Map
        [
          a.foo.oof.get('y'),
          b.foo.oof.get('y'),
          'y',
          'y',
          a.foo.oof,
          b.foo.oof,
          state,
        ],
        [a.foo.baz, b.foo.baz, 'baz', 'baz', a.foo, b.foo, state],
        ['x', 'x', 'x', 'x', a.foo.baz, b.foo.baz, state],
        [a.foo.bar, b.foo.bar, 'bar', 'bar', a.foo, b.foo, state],
        [a.foo.bar[1], b.foo.bar[1], 1, 1, a.foo.bar, b.foo.bar, state],
        [a.foo.bar[0], b.foo.bar[0], 0, 0, a.foo.bar, b.foo.bar, state],
      ];

      comparator(a, b, state);
      expect(customComparatorMock.mock.calls).toEqual(expectedParams);
    });
  });
});
