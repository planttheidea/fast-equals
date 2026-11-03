import { describe, expect, test } from 'vitest';
import {
  circularDeepEqual,
  circularShallowEqual,
  deepEqual,
  shallowEqual,
  strictCircularDeepEqual,
  strictCircularShallowEqual,
  strictDeepEqual,
  strictShallowEqual,
} from '../src/index.js';

const wrap = (value: unknown) => Object(value) as Record<PropertyKey, unknown>;

const wrappers = [
  { name: 'Number', create: () => wrap(1) },
  { name: 'String', create: () => wrap('one') },
  { name: 'Boolean', create: () => wrap(true) },
  { name: 'BigInt', create: () => wrap(BigInt(1)) },
];
const strictComparators = [
  { name: 'strictDeepEqual', compare: strictDeepEqual },
  { name: 'strictShallowEqual', compare: strictShallowEqual },
  { name: 'strictCircularDeepEqual', compare: strictCircularDeepEqual },
  { name: 'strictCircularShallowEqual', compare: strictCircularShallowEqual },
];

describe.each(wrappers)('$name own properties', ({ create }) => {
  describe.each(strictComparators)('$name', ({ compare }) => {
    test('compares enumerable and non-enumerable metadata in both directions', () => {
      for (const enumerable of [true, false]) {
        const left = Object.defineProperty(create(), 'meta', { enumerable, value: 1 });
        const equal = Object.defineProperty(create(), 'meta', { enumerable, value: 1 });
        const different = Object.defineProperty(create(), 'meta', { enumerable, value: 2 });

        expect(compare(left, equal)).toBe(true);
        expect(compare(left, different)).toBe(false);
        expect(compare(different, left)).toBe(false);
        expect(compare(left, create())).toBe(false);
        expect(compare(create(), left)).toBe(false);
      }
    });

    test('compares symbol metadata and property descriptors', () => {
      const symbol = Symbol('meta');
      const left = Object.defineProperty(create(), symbol, { value: 1, writable: true });
      const equal = Object.defineProperty(create(), symbol, { value: 1, writable: true });
      const different = Object.defineProperty(create(), symbol, { value: 2, writable: true });
      const readonly = Object.defineProperty(create(), symbol, { value: 1, writable: false });

      expect(compare(left, equal)).toBe(true);
      expect(compare(left, different)).toBe(false);
      expect(compare(left, readonly)).toBe(false);
      expect(compare(readonly, left)).toBe(false);
    });
  });

  test('retains deep versus shallow metadata comparisons', () => {
    const shared = { value: 1 };
    const left = Object.assign(create(), { meta: shared });
    const equal = Object.assign(create(), { meta: { value: 1 } });
    const different = Object.assign(create(), { meta: { value: 2 } });
    const sameReference = Object.assign(create(), { meta: shared });

    expect(strictDeepEqual(left, equal)).toBe(true);
    expect(strictDeepEqual(left, different)).toBe(false);
    expect(strictShallowEqual(left, equal)).toBe(false);
    expect(strictShallowEqual(left, sameReference)).toBe(true);
  });

  test('tracks circular metadata without losing different values or cycle shapes', () => {
    const left = Object.assign(create(), { meta: 1 });
    const equal = Object.assign(create(), { meta: 1 });
    const different = Object.assign(create(), { meta: 2 });

    left.self = left;
    equal.self = equal;
    different.self = different;
    const twoHop = Object.assign(create(), { meta: 1, self: Object.assign(create(), { meta: 1 }) });
    twoHop.self.self = twoHop;

    expect(strictCircularDeepEqual(left, equal)).toBe(true);
    expect(strictCircularDeepEqual(left, different)).toBe(false);
    expect(strictCircularDeepEqual(left, twoHop)).toBe(false);
    expect(strictCircularDeepEqual(twoHop, left)).toBe(false);
    expect(strictCircularShallowEqual(left, equal)).toBe(false);
    expect(strictCircularShallowEqual(left, left)).toBe(true);
  });

  test('keeps value-only behavior in loose modes', () => {
    const left = Object.assign(create(), { meta: 1 });
    const right = Object.assign(create(), { meta: 2 });
    left.self = left;
    right.self = right;

    for (const compare of [deepEqual, shallowEqual, circularDeepEqual, circularShallowEqual]) {
      expect(compare(left, right)).toBe(true);
    }
  });
});
