import { areMapsEqual } from '../src/maps';
import { deepEqual } from '../src/index';
import { sameValueZeroEqual } from '../src/utils';

describe('areMapsEqual', () => {
  it('should return false when maps are different sizes', () => {
    const a = new Map();
    const b = new Map().set('foo', 'bar');
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when maps have different keys', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('bar', 'bar');
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when maps have different values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'baz');
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when maps have the same size, keys, and values', () => {
    const a = new Map().set('foo', 'bar');
    const b = new Map().set('foo', 'bar');
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it('should return true when maps have the same size, keys, and values regardless of order', () => {
    const a = new Map().set('bar', 'foo').set('foo', 'bar');
    const b = new Map().set('foo', 'bar').set('bar', 'foo');
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it.each([
      [
        'being different references but equal',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        true,
      ],
      [
        'being unequal based on first',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ],
        false,
      ],
      [
        'being unequal based on last',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
        ],
        false,
      ],
      [
        'being unequal based on an intermediary entry',
        [
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
          [{ b: 'c' }, 2],
        ],
        [
          [{ b: 'c' }, 2],
          ['foo', 'different'],
          [{ b: 'c' }, 2],
        ],
        false,
      ],
    ])(
      'should handle `Map` entries %s',
      (_, aEntries: any[], bEntries: any[], expected) => {
        const mapA = new Map<any, any>(aEntries);
        const mapB = new Map<any, any>(bEntries);
        const cache = new WeakMap();

        expect(areMapsEqual(mapA, mapB, deepEqual, cache)).toBe(expected);
        expect(areMapsEqual(mapB, mapA, deepEqual, cache)).toBe(expected);
      },
    );
  });
});
