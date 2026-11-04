import { describe, expect, test } from 'vitest';
import {
  circularDeepEqual,
  circularShallowEqual,
  createCustomEqual,
  deepEqual,
  shallowEqual,
  strictCircularDeepEqual,
  strictCircularShallowEqual,
  strictDeepEqual,
  strictShallowEqual,
} from '../src/index.js';

const create = () => /pattern/g as RegExp & Record<PropertyKey, unknown>;
const strictComparators = [
  { name: 'strictDeepEqual', compare: strictDeepEqual },
  { name: 'strictShallowEqual', compare: strictShallowEqual },
  { name: 'strictCircularDeepEqual', compare: strictCircularDeepEqual },
  { name: 'strictCircularShallowEqual', compare: strictCircularShallowEqual },
];

describe.each(strictComparators)('$name RegExp own properties', ({ compare }) => {
  test('compares lastIndex as a non-enumerable own property', () => {
    const left = create();
    const equal = create();
    const different = create();
    left.lastIndex = equal.lastIndex = 1;
    different.lastIndex = 2;

    expect(compare(left, equal)).toBe(true);
    expect(compare(left, different)).toBe(false);
    expect(compare(different, left)).toBe(false);
  });

  test('compares enumerable, non-enumerable and symbol metadata', () => {
    for (const key of ['meta', Symbol('meta')]) {
      for (const enumerable of [false, true]) {
        const left = Object.defineProperty(create(), key, { enumerable, value: 1 });
        const equal = Object.defineProperty(create(), key, { enumerable, value: 1 });
        const different = Object.defineProperty(create(), key, { enumerable, value: 2 });

        expect(compare(left, equal)).toBe(true);
        expect(compare(left, different)).toBe(false);
        expect(compare(different, left)).toBe(false);
        expect(compare(left, create())).toBe(false);
        expect(compare(create(), left)).toBe(false);
      }
    }
  });

  test('compares descriptor shapes as well as their values', () => {
    const left = Object.defineProperty(create(), 'meta', { value: 1, writable: true });
    const different = Object.defineProperty(create(), 'meta', { value: 1, writable: false });

    expect(compare(left, different)).toBe(false);
    expect(compare(different, left)).toBe(false);
  });

  test('still compares the pattern and flags', () => {
    expect(compare(/pattern/g, /other/g)).toBe(false);
    expect(compare(/pattern/g, /pattern/i)).toBe(false);
    expect(compare(/pattern/gi, /pattern/gi)).toBe(true);
  });
});

test('RegExp metadata follows the selected deep or shallow comparison', () => {
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

test('strict circular RegExp comparisons distinguish metadata and cycle shapes', () => {
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

test('loose RegExp comparisons retain pattern-and-flags semantics', () => {
  const left = Object.assign(create(), { meta: 1 });
  const right = Object.assign(create(), { meta: 2 });
  left.lastIndex = 1;
  right.lastIndex = 2;
  left.self = left;
  right.self = right;

  for (const compare of [deepEqual, shallowEqual, circularDeepEqual, circularShallowEqual]) {
    expect(compare(left, right)).toBe(true);
  }
});

test('a custom RegExp comparator can override strict defaults', () => {
  const compare = createCustomEqual({
    circular: true,
    strict: true,
    createCustomConfig: () => ({ areRegExpsEqual: () => true }),
  });

  expect(compare(Object.assign(/left/g, { meta: 1 }), Object.assign(/right/i, { meta: 2 }))).toBe(true);
});
