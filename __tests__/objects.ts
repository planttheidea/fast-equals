import { areObjectsEqual } from '../src/objects';
import { sameValueZeroEqual } from '../src/utils';

describe('areObjectsEqual', () => {
  it('should return false when the objects have different key lengths', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', baz: 'baz', foo: 'foo' };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the objects have different keys', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { baz: 'bar', foo: 'foo' };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return false when the objects are not equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'baz', foo: 'foo' };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it('should return true when the objects are equal in value', () => {
    const a = { bar: 'bar', foo: 'foo' };
    const b = { bar: 'bar', foo: 'foo' };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });
});
