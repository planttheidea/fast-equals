import { runInNewContext } from 'node:vm';
import isEqual from 'lodash/isEqual.js';
import { describe, expect, test } from 'vitest';
import { createCustomEqual, deepEqual } from '../src/index.js';

const dictionary = () => {
  const attrs: { aspectRatio: number; dynamicContent: boolean; self?: object } = {
    aspectRatio: 16 / 9,
    dynamicContent: false,
  };
  Object.setPrototypeOf(attrs, null);
  return attrs;
};

describe('constructors', () => {
  test('keeps constructor checks enabled by default', () => {
    const attrs = dictionary();
    expect(deepEqual(attrs, { ...attrs })).toBe(false);
    expect(createCustomEqual()(attrs, { ...attrs })).toBe(false);
    expect(createCustomEqual({ constructors: true })(attrs, { ...attrs })).toBe(false);
  });

  test.each([false, true])('matches lodash for dictionaries with circular=%s', (circular) => {
    const equal = createCustomEqual({ circular, constructors: false });
    const attrs = dictionary();
    for (const [a, b] of [
      [attrs, { ...attrs }],
      [{ ...attrs }, attrs],
      [{ attrs }, { attrs: { ...attrs } }],
      [[attrs], [{ ...attrs }]],
      [new Map([['attrs', attrs]]), new Map([['attrs', { ...attrs }]])],
      [new Set([attrs]), new Set([{ ...attrs }])],
      [attrs, { ...attrs, aspectRatio: 2 }],
      [attrs, { aspectRatio: attrs.aspectRatio }],
      [attrs, { ...attrs, extra: undefined }],
    ]) {
      expect(equal(a, b)).toBe(isEqual(a, b));
    }
  });

  test('supports mixed-prototype cycles and detects changed values', () => {
    const equal = createCustomEqual({ circular: true, constructors: false });
    const a = dictionary();
    const b = { ...a };
    a.self = a;
    b.self = b;
    expect(equal(a, b)).toBe(true);
    expect(equal(b, a)).toBe(true);
    b.aspectRatio = 2;
    expect(equal(a, b)).toBe(false);
  });

  test('retains descriptor checks in strict mode', () => {
    const equal = createCustomEqual({ strict: true, constructors: false });
    const a = dictionary();
    const b = { ...a };
    expect(equal(a, b)).toBe(true);
    Object.defineProperty(b, 'aspectRatio', { writable: false });
    expect(equal(a, b)).toBe(false);
  });

  test('still compares own constructor properties', () => {
    const equal = createCustomEqual({ constructors: false });
    expect(equal({ constructor: 1 }, { constructor: 2 })).toBe(false);
  });

  test('permits different classes when explicitly requested', () => {
    class A {
      value = 1;
    }
    class B {
      value = 1;
    }
    const equal = createCustomEqual({ constructors: false });
    expect(deepEqual(new A(), new B())).toBe(false);
    expect(equal(new A(), new B())).toBe(true);
    expect(equal(new A(), { value: 1 })).toBe(true);
    expect(equal({ value: 1 }, new A())).toBe(true);
  });

  test('compares matching built-in types across realms', () => {
    const equal = createCustomEqual({ constructors: false });
    const foreign = runInNewContext('({date: new Date(1), array: [1, 2], map: new Map([[1, 2]])})');
    expect(equal(foreign.date, new Date(1))).toBe(true);
    expect(equal(new Date(1), foreign.date)).toBe(true);
    expect(equal(foreign.array, [1, 2])).toBe(true);
    expect(equal(foreign.map, new Map([[1, 2]]))).toBe(true);
  });

  test('rejects incompatible types in either argument order', () => {
    const equal = createCustomEqual({ constructors: false });
    for (const [a, b] of [
      [new Date(1), {}],
      [[], {}],
      [new Map(), new Set()],
      [new Uint8Array([1]), new Int8Array([1])],
      [Promise.resolve(1), Promise.resolve(1)],
    ]) {
      expect(equal(a, b)).toBe(false);
      expect(equal(b, a)).toBe(false);
    }
  });

  test('allows custom config to override the constructor policy', () => {
    const attrs = dictionary();
    const equal = createCustomEqual({
      createCustomConfig: (config) => {
        expect(config.constructors).toBe(true);
        return { constructors: false };
      },
    });
    const checked = createCustomEqual({
      constructors: false,
      createCustomConfig: (config) => {
        expect(config.constructors).toBe(false);
        return { constructors: true };
      },
    });
    expect(equal(attrs, { ...attrs })).toBe(true);
    expect(checked(attrs, { ...attrs })).toBe(false);
  });

  test('uses the configured object comparator for mismatched constructors', () => {
    const equal = createCustomEqual({
      constructors: false,
      createCustomConfig: () => ({ areObjectsEqual: (a, b) => a.id === b.id }),
    });
    const a = Object.assign(Object.create(null), { id: 1, label: 'before' });
    expect(equal(a, { id: 1, label: 'after' })).toBe(true);
    expect(equal(a, { id: 2, label: 'before' })).toBe(false);
  });
});
