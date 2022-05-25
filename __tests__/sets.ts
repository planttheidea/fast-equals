import { areSetsEqual } from '../src/sets';
import { deepEqual } from '../src/index';
import { sameValueZeroEqual } from '../src/utils';

describe('areSetsEqual', () => {
  it('should return false when the sets have different sizes', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar');
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the sets have different values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('bar');
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the sets have the same values', () => {
    const a = new Set().add('foo');
    const b = new Set().add('foo');
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it('should return true when the sets have the same values regardless of order', () => {
    const a = new Set().add('foo').add('bar');
    const b = new Set().add('bar').add('foo');
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe('issue 58 - key and value being identical', () => {
    it.each([
      [
        'being different references but equal',
        [{ b: 'c' }, { b: 'c' }],
        [{ b: 'c' }, { b: 'c' }],
        true,
      ],
      [
        'being unequal based on first',
        [{ b: 'c' }, { b: 'c' }],
        ['foo', { b: 'c' }],
        false,
      ],
      [
        'being unequal based on last',
        [{ b: 'c' }, { b: 'c' }],
        [{ b: 'c' }, 'foo'],
        false,
      ],
      [
        'being unequal based on an intermediary entry',
        [{ b: 'c' }, { b: 'c' }, { b: 'c' }],
        [{ b: 'c' }, 'foo', { b: 'c' }],
        false,
      ],
    ])('should handle `Set` entries %s', (_, aEntries, bEntries, expected) => {
      const setA = new Set<any>(aEntries);
      const setB = new Set<any>(bEntries);
      const cache = new WeakMap();

      expect(areSetsEqual(setA, setB, deepEqual, cache)).toBe(expected);
      expect(areSetsEqual(setB, setA, deepEqual, cache)).toBe(expected);
    });
  });
});
