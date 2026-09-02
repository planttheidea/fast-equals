import { describe, expect, test } from 'vitest';
import { createEqualityComparator, createInternalEqualityComparator } from '../src/comparator.js';
import * as equals from '../src/equals.js';
import { strictEqual, sameValueEqual } from '../src/equals.js';
import {
  circularDeepEqual,
  createCustomEqual,
  deepEqual,
  shallowEqual,
  strictCircularDeepEqual,
  strictDeepEqual,
} from '../src/index.js';
import type { ComparatorConfig, InternalEqualityComparator } from '../src/internalTypes.ts';

function build(useLookup: boolean) {
  const config = {
    areArrayBuffersEqual: equals.areArrayBuffersEqual,
    areArraysEqual: equals.areArraysEqual,
    areDataViewsEqual: equals.areDataViewsEqual,
    areDatesEqual: equals.areDatesEqual,
    areErrorsEqual: equals.areErrorsEqual,
    areFunctionsEqual: strictEqual,
    areMapsEqual: useLookup ? equals.areMapsEqualByLookup : equals.areMapsEqual,
    areNumbersEqual: sameValueEqual,
    areObjectsEqual: equals.areObjectsEqual,
    arePrimitiveWrappersEqual: equals.arePrimitiveWrappersEqual,
    areRegExpsEqual: equals.areRegExpsEqual,
    areSetsEqual: useLookup ? equals.areSetsEqualByLookup : equals.areSetsEqual,
    areTypedArraysEqual: equals.areTypedArraysEqual,
    areUrlsEqual: equals.areUrlsEqual,
    getUnsupportedCustomComparator: undefined,
  } as ComparatorConfig<undefined>;
  const comparator = createEqualityComparator(config);
  const equalsFn = createInternalEqualityComparator(comparator);
  return (a: any, b: any) => comparator(a, b, { cache: undefined, equals: equalsFn, meta: undefined, strict: false });
}

const reference = build(false);
const lookup = build(true);

// Deterministic PRNG so failures are reproducible.
let seed = 1;
const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!;

const SHARED_KEY = { shared: true };
const SHARED_VALUE = { sharedValue: true };

function makeKey() {
  const kind = Math.floor(rand() * 7);
  if (kind === 0) return pick(['a', 'b', 'c']);
  if (kind === 1) return Math.floor(rand() * 3);
  if (kind === 2) return NaN;
  if (kind === 3) return SHARED_KEY;
  if (kind === 4) return { id: Math.floor(rand() * 3) };
  if (kind === 5) return [Math.floor(rand() * 3)];
  return pick([true, null, undefined]);
}

function makeValue() {
  const kind = Math.floor(rand() * 5);
  if (kind === 0) return Math.floor(rand() * 3);
  if (kind === 1) return pick(['x', 'y']);
  if (kind === 2) return SHARED_VALUE;
  if (kind === 3) return { v: Math.floor(rand() * 3) };
  return NaN;
}

function makeMap(size: number) {
  const map = new Map();
  let guard = 0;
  while (map.size < size && guard++ < size * 20) map.set(makeKey(), makeValue());
  return map;
}

function makeSet(size: number) {
  const set = new Set();
  let guard = 0;
  while (set.size < size && guard++ < size * 20) set.add(makeKey());
  return set;
}

/**
 * The lookup comparators resolve entries by `has` before falling back to the exhaustive scan.
 * A lookup only ever resolves keys held by *identity*, so everything below exercises the property
 * that matters most: a lookup miss defers the entry to the scan, where keys are compared by value
 * exactly as they always were. Deep key equality is not weakened to a plain key lookup.
 */
describe('keys and values that are deeply equal but not identical', () => {
  describe('Map', () => {
    test('resolves object keys that are deeply equal but share no reference', () => {
      expect(deepEqual(new Map([[{ id: 1 }, 'value']]), new Map([[{ id: 1 }, 'value']]))).toBe(true);
      expect(deepEqual(new Map([[{ id: 1 }, 'value']]), new Map([[{ id: 2 }, 'value']]))).toBe(false);
    });

    test('resolves keys that are deeply equal only several levels down', () => {
      const a = new Map([[{ a: { b: [1, { c: 2 }] } }, 'value']]);
      const b = new Map([[{ a: { b: [1, { c: 2 }] } }, 'value']]);
      const c = new Map([[{ a: { b: [1, { c: 3 }] } }, 'value']]);

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });

    test('resolves keys of every type the comparator supports, not just plain objects', () => {
      expect(deepEqual(new Map([[[1, 2], 'value']]), new Map([[[1, 2], 'value']]))).toBe(true);
      expect(deepEqual(new Map([[[1, 2], 'value']]), new Map([[[1, 3], 'value']]))).toBe(false);
      expect(deepEqual(new Map([[new Date(0), 'value']]), new Map([[new Date(0), 'value']]))).toBe(true);
      expect(deepEqual(new Map([[new Date(0), 'value']]), new Map([[new Date(1), 'value']]))).toBe(false);
      expect(deepEqual(new Map([[/foo/g, 'value']]), new Map([[/foo/g, 'value']]))).toBe(true);
      expect(deepEqual(new Map([[/foo/g, 'value']]), new Map([[/foo/i, 'value']]))).toBe(false);
    });

    test('resolves keys that are themselves `Map`s, recursing back through the comparator', () => {
      const a = new Map([[new Map([['inner', { deep: true }]]), 'value']]);
      const b = new Map([[new Map([['inner', { deep: true }]]), 'value']]);
      const c = new Map([[new Map([['inner', { deep: false }]]), 'value']]);

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, c)).toBe(false);
    });

    test('resolves values that are deeply equal but not identical, under an identity key', () => {
      const key = { shared: true };

      expect(deepEqual(new Map([[key, { v: [1, 2] }]]), new Map([[key, { v: [1, 2] }]]))).toBe(true);
      expect(deepEqual(new Map([[key, { v: [1, 2] }]]), new Map([[key, { v: [1, 3] }]]))).toBe(false);
    });

    test('ignores entry order for deeply equal keys', () => {
      const a = new Map<any, any>([
        [{ id: 1 }, 'one'],
        [{ id: 2 }, 'two'],
      ]);
      const b = new Map<any, any>([
        [{ id: 2 }, 'two'],
        [{ id: 1 }, 'one'],
      ]);
      const swapped = new Map<any, any>([
        [{ id: 2 }, 'one'],
        [{ id: 1 }, 'two'],
      ]);

      expect(deepEqual(a, b)).toBe(true);
      expect(deepEqual(a, swapped)).toBe(false);
    });

    test('resolves `NaN` keys, which `has` matches by SameValueZero', () => {
      expect(deepEqual(new Map([[NaN, 'value']]), new Map([[NaN, 'value']]))).toBe(true);
      expect(deepEqual(new Map([[NaN, 'value']]), new Map([[NaN, 'other']]))).toBe(false);
    });
  });

  describe('Set', () => {
    test('resolves members that are deeply equal but share no reference', () => {
      expect(deepEqual(new Set([{ id: 1 }]), new Set([{ id: 1 }]))).toBe(true);
      expect(deepEqual(new Set([{ id: 1 }]), new Set([{ id: 2 }]))).toBe(false);
    });

    test('resolves members that are deeply equal only several levels down', () => {
      expect(deepEqual(new Set([{ a: [1, { b: 2 }] }]), new Set([{ a: [1, { b: 2 }] }]))).toBe(true);
      expect(deepEqual(new Set([{ a: [1, { b: 2 }] }]), new Set([{ a: [1, { b: 3 }] }]))).toBe(false);
    });

    test('ignores member order for deeply equal members', () => {
      expect(deepEqual(new Set([{ id: 1 }, { id: 2 }]), new Set([{ id: 2 }, { id: 1 }]))).toBe(true);
    });

    test('counts repeated deeply equal members, which are distinct `Set` entries', () => {
      // Two distinct objects that are deeply equal are two members, so the multisets must agree.
      expect(deepEqual(new Set([{ id: 1 }, { id: 1 }]), new Set([{ id: 1 }, { id: 1 }]))).toBe(true);
      expect(deepEqual(new Set([{ id: 1 }, { id: 1 }]), new Set([{ id: 1 }, { id: 2 }]))).toBe(false);
      expect(deepEqual(new Set([{ id: 1 }, { id: 2 }]), new Set([{ id: 1 }, { id: 1 }]))).toBe(false);
    });
  });
});

describe('mixing lookup hits with deeply equal matches', () => {
  const SHARED = { shared: true };

  test('resolves a `Map` holding both a shared key and a deep-equal-only key', () => {
    expect(
      deepEqual(
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 9 }, 2],
        ]),
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 9 }, 2],
        ]),
      ),
    ).toBe(true);
    expect(
      deepEqual(
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 9 }, 2],
        ]),
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 8 }, 2],
        ]),
      ),
    ).toBe(false);
  });

  test('defers an entry whose key is found but whose value differs, rather than failing', () => {
    // `SHARED` is present in both, so the lookup finds it, but the values do not match. The entry
    // must fall through to the scan, where it matches the *other* entry by deep key equality.
    const a = new Map<any, any>([
      [SHARED, 'A'],
      [{ shared: true }, 'B'],
    ]);
    const b = new Map<any, any>([
      [SHARED, 'B'],
      [{ shared: true }, 'A'],
    ]);

    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, b)).toBe(reference(a, b));
  });

  test('does not let a lookup hit consume an entry another key needed', () => {
    // Every key here is deeply equal to every other, so the matching is entirely ambiguous and a
    // greedy claim by the lookup could strand a later entry if it were not equivalent.
    const a = new Map<any, any>([
      [SHARED, 'A'],
      [{ shared: true }, 'A'],
      [{ shared: true }, 'B'],
    ]);
    const b = new Map<any, any>([
      [{ shared: true }, 'B'],
      [SHARED, 'A'],
      [{ shared: true }, 'A'],
    ]);

    expect(deepEqual(a, b)).toBe(true);
    expect(deepEqual(a, b)).toBe(reference(a, b));
  });

  test('resolves a `Set` holding both a shared member and a deep-equal-only member', () => {
    expect(deepEqual(new Set([SHARED, { id: 1 }]), new Set([SHARED, { id: 1 }]))).toBe(true);
    expect(deepEqual(new Set([SHARED, { id: 1 }]), new Set([SHARED, { id: 2 }]))).toBe(false);
  });

  test('agrees with the reference implementation on each of these', () => {
    const cases: Array<[Map<any, any> | Set<any>, Map<any, any> | Set<any>]> = [
      [new Map([[{ id: 1 }, 'v']]), new Map([[{ id: 1 }, 'v']])],
      [
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 9 }, 2],
        ]),
        new Map<any, any>([
          [SHARED, 1],
          [{ id: 9 }, 2],
        ]),
      ],
      [
        new Map<any, any>([
          [SHARED, 'A'],
          [{ shared: true }, 'B'],
        ]),
        new Map<any, any>([
          [SHARED, 'B'],
          [{ shared: true }, 'A'],
        ]),
      ],
      [new Set([SHARED, { id: 1 }]), new Set([SHARED, { id: 1 }])],
      [new Set([{ id: 1 }, { id: 1 }]), new Set([{ id: 1 }, { id: 2 }])],
    ];

    for (const [a, b] of cases) {
      expect(lookup(a, b)).toBe(reference(a, b));
    }
  });
});

const SHARED_MEMBER = { shared: true };

describe('deeply equal keys across the built-in variants', () => {
  const build = () =>
    new Map<any, any>([
      [{ id: 1 }, { value: [1, 2] }],
      [{ id: 2 }, { value: [3, 4] }],
    ]);
  const buildSet = () => new Set([{ id: 1 }, { id: 2 }]);

  test('strictDeepEqual', () => {
    expect(strictDeepEqual(build(), build())).toBe(true);
    expect(
      strictDeepEqual(
        build(),
        new Map<any, any>([
          [{ id: 1 }, { value: [1, 2] }],
          [{ id: 3 }, { value: [3, 4] }],
        ]),
      ),
    ).toBe(false);
    expect(strictDeepEqual(buildSet(), buildSet())).toBe(true);
  });

  test('circularDeepEqual', () => {
    expect(circularDeepEqual(build(), build())).toBe(true);
    expect(circularDeepEqual(buildSet(), buildSet())).toBe(true);

    // A `Map` that contains itself still resolves, and the self-reference is not confused for a
    // deeply equal key.
    const a = new Map<any, any>([[{ id: 1 }, 'value']]);
    const b = new Map<any, any>([[{ id: 1 }, 'value']]);

    a.set('self', a);
    b.set('self', b);

    expect(circularDeepEqual(a, b)).toBe(true);
  });

  test('strictCircularDeepEqual', () => {
    expect(strictCircularDeepEqual(build(), build())).toBe(true);
    expect(strictCircularDeepEqual(buildSet(), buildSet())).toBe(true);
  });

  test('shallowEqual keeps identity semantics for members', () => {
    // The shallow variants supply a custom internal comparator, so they use the exhaustive scan
    // and compare members by `SameValue` rather than deeply.
    expect(shallowEqual(new Set([{ id: 1 }]), new Set([{ id: 1 }]))).toBe(false);
    expect(shallowEqual(new Set([SHARED_MEMBER]), new Set([SHARED_MEMBER]))).toBe(true);
  });
});

describe('lookup comparators agree with the reference implementation', () => {
  test('maps', () => {
    const mismatches: string[] = [];
    for (let i = 0; i < 25000; i++) {
      const size = 1 + Math.floor(rand() * 8);
      const a = makeMap(size);
      const b = rand() < 0.5 ? makeMap(size) : new Map([...makeMap(size)].reverse());
      const r = reference(a, b);
      const l = lookup(a, b);
      if (r !== l)
        mismatches.push(`i=${i} ref=${r} lookup=${l} a=${JSON.stringify([...a])} b=${JSON.stringify([...b])}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  test('sets', () => {
    const mismatches: string[] = [];
    for (let i = 0; i < 25000; i++) {
      const size = 1 + Math.floor(rand() * 8);
      const a = makeSet(size);
      const b = rand() < 0.5 ? makeSet(size) : new Set([...makeSet(size)].reverse());
      const r = reference(a, b);
      const l = lookup(a, b);
      if (r !== l) mismatches.push(`i=${i} ref=${r} lookup=${l}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  test('ambiguous matchings where a shared reference competes with a deep-equal twin', () => {
    const mismatches: string[] = [];

    for (let i = 0; i < 25000; i++) {
      // Keys are drawn from a pool where a shared reference and structurally identical
      // distinct objects coexist, so an identity hit and a deep-equal hit compete.
      const pool = () => pick([SHARED_KEY, { shared: true }, { shared: true }]);
      const size = 2 + Math.floor(rand() * 3);
      const a = new Map();
      const b = new Map();
      let guard = 0;
      while (a.size < size && guard++ < 50) a.set(pool(), pick(['A', 'B']));
      guard = 0;
      while (b.size < a.size && guard++ < 50) b.set(pool(), pick(['A', 'B']));
      if (a.size !== b.size) continue;
      if (reference(a, b) !== lookup(a, b)) {
        mismatches.push(`i=${i} a=${[...a.values()]} b=${[...b.values()]}`);
      }
    }

    expect(mismatches.slice(0, 5)).toEqual([]);
  });

  test('self-comparison and nested', () => {
    const mismatches: string[] = [];
    for (let i = 0; i < 5000; i++) {
      const a = new Map([
        ['nested', makeMap(3)],
        ['set', makeSet(3) as any],
      ]);
      const b = new Map([
        ['set', makeSet(3) as any],
        ['nested', makeMap(3)],
      ]);
      if (reference(a, b) !== lookup(a, b)) mismatches.push(`i=${i}`);
    }
    expect(mismatches.slice(0, 5)).toEqual([]);
  });
});

describe('a custom internal comparator keeps the exhaustive scan', () => {
  test('receives the iteration index of the key within each `Map`', () => {
    const seen: Array<[number, number]> = [];
    const isEqual = createCustomEqual({
      createInternalComparator:
        (compare): InternalEqualityComparator<undefined> =>
        (a, b, indexOrKeyA, indexOrKeyB, parentA, parentB, state) => {
          if (parentA instanceof Map && typeof indexOrKeyA === 'number' && typeof indexOrKeyB === 'number') {
            seen.push([indexOrKeyA, indexOrKeyB]);

            expect(indexOrKeyA).toBe([...parentA.keys()].indexOf(a));
            expect(indexOrKeyB).toBe([...(parentB as Map<any, any>).keys()].indexOf(b));
          }

          return compare(a, b, state);
        },
    });

    const a = new Map([
      ['foo', 'bar'],
      ['oof', 'baz'],
    ]);
    const b = new Map([
      ['oof', 'baz'],
      ['foo', 'bar'],
    ]);

    expect(isEqual(a, b)).toBe(true);
    // The scan is exhaustive, so the key of `a` at index 0 is compared against the key of `b` at
    // index 0 before matching the one at index 1. A lookup would skip that comparison entirely.
    expect(seen).toContainEqual([0, 0]);
    expect(seen).toContainEqual([0, 1]);
  });

  test('is invoked for every candidate comparison, including ones that do not match', () => {
    const calls: Array<[unknown, unknown]> = [];
    const isEqual = createCustomEqual({
      createInternalComparator:
        (compare): InternalEqualityComparator<undefined> =>
        (a, b, _indexOrKeyA, _indexOrKeyB, parentA, _parentB, state) => {
          if (parentA instanceof Set) {
            calls.push([a, b]);
          }

          return compare(a, b, state);
        },
    });

    expect(isEqual(new Set(['a', 'b']), new Set(['b', 'a']))).toBe(true);
    // 'a' is compared against 'b' before finding its match, which a lookup would never do.
    expect(calls).toContainEqual(['a', 'b']);
  });

  test('produces the same results as the built-in comparators', () => {
    const isEqual = createCustomEqual({
      createInternalComparator:
        (compare): InternalEqualityComparator<undefined> =>
        (a, b, _indexOrKeyA, _indexOrKeyB, _parentA, _parentB, state) =>
          compare(a, b, state),
    });

    const cases: Array<[any, any]> = [
      [new Map([['a', 1]]), new Map([['a', 1]])],
      [new Map([['a', 1]]), new Map([['a', 2]])],
      [new Map([[{ id: 1 }, 'v']]), new Map([[{ id: 1 }, 'v']])],
      [new Set([1, 2, 3]), new Set([3, 2, 1])],
      [new Set([{ id: 1 }]), new Set([{ id: 1 }])],
      [new Set([1, 2]), new Set([1, 3])],
      [new Map(), new Map()],
      [new Set(), new Set()],
    ];

    for (const [a, b] of cases) {
      expect(isEqual(a, b)).toBe(deepEqual(a, b));
    }
  });
});

describe('chunked TypedArray comparison agrees with element-wise comparison', () => {
  const INTEGER_VIEWS = [
    Uint8Array,
    Uint8ClampedArray,
    Int8Array,
    Uint16Array,
    Int16Array,
    Uint32Array,
    Int32Array,
  ] as const;

  function elementwise(a: any, b: any): boolean {
    if (a.length !== b.length || a.byteOffset !== b.byteOffset) {
      return false;
    }

    for (let index = 0; index < a.length; index++) {
      if (a[index] !== b[index]) {
        return false;
      }
    }

    return true;
  }

  test('across view types, lengths, offsets and mutation points', () => {
    const mismatches: string[] = [];

    for (const View of INTEGER_VIEWS) {
      // Lengths chosen to straddle the chunking threshold and to leave byte remainders.
      for (const length of [0, 1, 7, 8, 15, 31, 63, 64, 65, 127, 128, 129, 255, 257, 1000, 1024]) {
        for (const byteOffset of [0, View.BYTES_PER_ELEMENT, 8, 24]) {
          const bytes = length * View.BYTES_PER_ELEMENT;
          const buffer = () => new ArrayBuffer(bytes + byteOffset + 8);
          const build = () => {
            const view = new View(buffer(), byteOffset, length);
            for (let i = 0; i < length; i++) {
              view[i] = (i * 31) % 251;
            }
            return view;
          };

          const a = build();

          // Equal, then unequal at the first, middle and last element.
          const variants: Array<[string, any]> = [['equal', build()]];

          for (const at of [0, length >> 1, length - 1]) {
            if (at < 0) {
              continue;
            }

            const changed = build();
            changed[at] = changed[at]! + 1;
            variants.push([`differs at ${at}`, changed]);
          }

          for (const [label, b] of variants) {
            const expected = elementwise(a, b);
            const actual = equals.areTypedArraysEqual(a, b);

            if (expected !== actual) {
              mismatches.push(
                `${View.name} length=${length} offset=${byteOffset} ${label}: expected ${expected}, got ${actual}`,
              );
            }
          }
        }
      }
    }

    expect(mismatches.slice(0, 10)).toEqual([]);
  });

  test('`ArrayBuffer` and `DataView` of every length', () => {
    const mismatches: string[] = [];

    for (let length = 0; length <= 300; length++) {
      const build = (mutateAt?: number) => {
        const buffer = new ArrayBuffer(length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
          view[i] = (i * 17) % 253;
        }
        if (mutateAt !== undefined && mutateAt < length) {
          view[mutateAt] = view[mutateAt]! ^ 0xff;
        }
        return buffer;
      };

      if (!deepEqual(build(), build())) {
        mismatches.push(`ArrayBuffer length=${length} reported unequal`);
      }

      if (length && deepEqual(build(), build(length - 1))) {
        mismatches.push(`ArrayBuffer length=${length} missed a difference in the final byte`);
      }

      if (!deepEqual(new DataView(build()), new DataView(build()))) {
        mismatches.push(`DataView length=${length} reported unequal`);
      }

      if (length && deepEqual(new DataView(build()), new DataView(build(0)))) {
        mismatches.push(`DataView length=${length} missed a difference in the first byte`);
      }
    }

    expect(mismatches.slice(0, 10)).toEqual([]);
  });

  test('`BigInt64Array` and `BigUint64Array`', () => {
    for (const View of [BigInt64Array, BigUint64Array] as const) {
      const build = (mutateAt?: number) => {
        const view = new View(40);
        for (let i = 0; i < view.length; i++) {
          view[i] = BigInt(i * 7);
        }
        if (mutateAt !== undefined) {
          view[mutateAt] = BigInt(-1);
        }
        return view;
      };

      expect(deepEqual(build(), build())).toBe(true);
      expect(deepEqual(build(), build(0))).toBe(false);
      expect(deepEqual(build(), build(39))).toBe(false);
    }
  });
});
