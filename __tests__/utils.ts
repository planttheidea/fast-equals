/* globals afterEach,beforeEach,describe,expect,it,jest */

import * as React from "react";
import { deepEqual } from "../src/index";

import { areArraysEqual } from "../src/arrays";
import { getNewCache } from "../src/cache";
import { areMapsEqual } from "../src/maps";
import { areObjectsEqual, isReactElement } from "../src/objects";
import { areRegExpsEqual } from "../src/primitives";
import { areSetsEqual } from "../src/sets";

import {
  // createCircularEqualCreator,
  isPlainObject,
  isPromiseLike,
  sameValueZeroEqual,
} from "../src/utils";

import {
  alternativeValues,
  mainValues,
  primitiveValues,
} from "./__helpers__/dataTypes";

describe("areArraysEqual", () => {
  it("should return false when the arrays are different lengths", () => {
    const a = ["foo", "bar"];
    const b = ["foo", "bar", "baz"];
    const cache = new WeakMap();

    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when the arrays are not equal in value", () => {
    const a = ["foo", "bar"];
    const cache = new WeakMap();

    const b = ["foo", "baz"];
    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return true when the arrays are equal in value", () => {
    const a = ["foo", "bar"];
    const b = ["foo", "bar"];
    const cache = new WeakMap();

    expect(areArraysEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });
});

describe("areMapsEqual", () => {
  it("should return false when maps are different sizes", () => {
    const a = new Map();
    const b = new Map().set("foo", "bar");
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when maps have different keys", () => {
    const a = new Map().set("foo", "bar");
    const b = new Map().set("bar", "bar");
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when maps have different values", () => {
    const a = new Map().set("foo", "bar");
    const b = new Map().set("foo", "baz");
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return true when maps have the same size, keys, and values", () => {
    const a = new Map().set("foo", "bar");
    const b = new Map().set("foo", "bar");
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it("should return true when maps have the same size, keys, and values regardless of order", () => {
    const a = new Map().set("bar", "foo").set("foo", "bar");
    const b = new Map().set("foo", "bar").set("bar", "foo");
    const cache = new WeakMap();

    expect(areMapsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe("issue 58 - key and value being identical", () => {
    it.each([
      [
        "being different references but equal",
        [
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
        ],
        [
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
        ],
        true,
      ],
      [
        "being unequal based on first",
        [
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
        ],
        [
          ["foo", "different"],
          [{ b: "c" }, 2],
        ],
        false,
      ],
      [
        "being unequal based on last",
        [
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
        ],
        [
          [{ b: "c" }, 2],
          ["foo", "different"],
        ],
        false,
      ],
      [
        "being unequal based on an intermediary entry",
        [
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
          [{ b: "c" }, 2],
        ],
        [
          [{ b: "c" }, 2],
          ["foo", "different"],
          [{ b: "c" }, 2],
        ],
        false,
      ],
    ])(
      "should handle `Map` entries %s",
      (_, aEntries: any[], bEntries: any[], expected) => {
        const mapA = new Map<any, any>(aEntries);
        const mapB = new Map<any, any>(bEntries);
        const cache = new WeakMap();

        expect(areMapsEqual(mapA, mapB, deepEqual, cache)).toBe(expected);
        expect(areMapsEqual(mapB, mapA, deepEqual, cache)).toBe(expected);
      }
    );
  });
});

describe("areObjectsEqual", () => {
  it("should return false when the objects have different key lengths", () => {
    const a = { bar: "bar", foo: "foo" };
    const b = { bar: "bar", baz: "baz", foo: "foo" };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when the objects have different keys", () => {
    const a = { bar: "bar", foo: "foo" };
    const b = { baz: "bar", foo: "foo" };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when the objects are not equal in value", () => {
    const a = { bar: "bar", foo: "foo" };
    const b = { bar: "baz", foo: "foo" };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return true when the objects are equal in value", () => {
    const a = { bar: "bar", foo: "foo" };
    const b = { bar: "bar", foo: "foo" };
    const cache = new WeakMap();

    expect(areObjectsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });
});

describe("areRegExpsEqual", () => {
  it("should return false if the source values are different", () => {
    const a = new RegExp("foo");
    const b = new RegExp("bar");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return false if the global flag is different", () => {
    const a = new RegExp("foo", "g");
    const b = new RegExp("foo");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return false if the ignoreCase flag is different", () => {
    const a = new RegExp("foo", "i");
    const b = new RegExp("foo");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return false if the multiline flag is different", () => {
    const a = new RegExp("foo", "m");
    const b = new RegExp("foo");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return false if the unicode flag is different", () => {
    const a = new RegExp("\u{61}", "u");
    const b = new RegExp("\u{61}");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return false if the sticky flag is different", () => {
    const a = new RegExp("foo", "y");
    const b = new RegExp("foo");

    expect(areRegExpsEqual(a, b)).toBe(false);
  });

  it("should return true if the values and flags are equal", () => {
    const a = new RegExp("foo", "gi");
    const b = new RegExp("foo", "ig");

    expect(areRegExpsEqual(a, b)).toBe(true);
  });
});

describe("areSetsEqual", () => {
  it("should return false when the sets have different sizes", () => {
    const a = new Set().add("foo").add("bar");
    const b = new Set().add("bar");
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return false when the sets have different values", () => {
    const a = new Set().add("foo");
    const b = new Set().add("bar");
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(false);
  });

  it("should return true when the sets have the same values", () => {
    const a = new Set().add("foo");
    const b = new Set().add("foo");
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  it("should return true when the sets have the same values regardless of order", () => {
    const a = new Set().add("foo").add("bar");
    const b = new Set().add("bar").add("foo");
    const cache = new WeakMap();

    expect(areSetsEqual(a, b, sameValueZeroEqual, cache)).toBe(true);
  });

  describe("issue 58 - key and value being identical", () => {
    it.each([
      [
        "being different references but equal",
        [{ b: "c" }, { b: "c" }],
        [{ b: "c" }, { b: "c" }],
        true,
      ],
      [
        "being unequal based on first",
        [{ b: "c" }, { b: "c" }],
        ["foo", { b: "c" }],
        false,
      ],
      [
        "being unequal based on last",
        [{ b: "c" }, { b: "c" }],
        [{ b: "c" }, "foo"],
        false,
      ],
      [
        "being unequal based on an intermediary entry",
        [{ b: "c" }, { b: "c" }, { b: "c" }],
        [{ b: "c" }, "foo", { b: "c" }],
        false,
      ],
    ])("should handle `Set` entries %s", (_, aEntries, bEntries, expected) => {
      const setA = new Set<any>(aEntries);
      const setB = new Set<any>(bEntries);
      const cache = new WeakMap();

      expect(areSetsEqual(setA, setB, deepEqual, cache)).toBe(expected);
      expect(areSetsEqual(setB, setA, deepEqual, cache)).toBe(expected);
    });
  });
});

// describe("createCircularEqualCreator", () => {
//   it("should create the custom comparator that stores the values in fallback cache", () => {
//     const wm = global.WeakMap;

//     const entries: any[] = [];

//     const del = jest.fn((key) => {
//       const index = entries.findIndex((entry) => entry[0] === key);

//       if (index === -1) {
//         entries.splice(index, 1);
//       }
//     });
//     const get = jest.fn((key) => entries.find((entry) => entry[0] === key));
//     const set = jest.fn((key, value) => entries.push([key, value]));

//     // @ts-ignore
//     global.WeakMap = function WeakMap() {
//       this._entries = entries;

//       this.delete = del;
//       this.get = get;
//       this.set = set;
//     };

//     const handler = createCircularEqualCreator(undefined);

//     const isDeepEqual = jest.fn().mockReturnValue(true);

//     const internalComparator = handler(isDeepEqual);

//     const a = { foo: "bar" };
//     const b = { foo: "bar" };

//     const result = internalComparator(
//       a,
//       a,
//       undefined,
//       undefined,
//       undefined,
//       undefined,
//       undefined
//     );

//     expect(get).toHaveBeenCalledTimes(1);
//     expect(get).toHaveBeenCalledWith(a);

//     get.mockClear();

//     expect(set).toHaveBeenCalledTimes(2);
//     expect(set).toHaveBeenNthCalledWith(1, a, b);
//     expect(set).toHaveBeenNthCalledWith(2, b, a);

//     set.mockClear();

//     expect(result).toBe(true);

//     global.WeakMap = wm;
//   });
// });

// describe("getNewCache", () => {
//   it("should return a new WeakMap when support is present", () => {
//     const cache = getNewCache();

//     expect(cache).toBeInstanceOf(WeakMap);
//   });

//   it("should work the same with the fallback when WeakMap is not supported", () => {
//     const cache = getNewCacheFallback();

//     expect(cache).not.toBeInstanceOf(WeakMap);

//     const value = { foo: "bar" };

//     expect(cache.get(value)).toBe(undefined);

//     cache.set(value, value);

//     expect(cache.get(value)).toBe(value);
//   });
// });

describe("isReactElement", () => {
  it("should return true if the appropriate keys are present and truthy", () => {
    const div = React.createElement("div", {}, "foo");

    expect(isReactElement(div)).toBe(true);
  });

  it("should return false if the appropriate keys are not present", () => {
    const div = { foo: "bar" };

    expect(isReactElement(div)).toBe(false);
  });
});

describe("isPlainObject", () => {
  it("should return true when a plain object", () => {
    const a = {};

    expect(isPlainObject(a)).toBe(true);
  });

  it("should return true when a pure object", () => {
    const a = Object.create(null);

    expect(isPlainObject(a)).toBe(true);
  });

  it("should return false when not a standard object", () => {
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
  });

  it("should return true when an object made via Object.create()", () => {
    const a = Object.create({ foo: "bar" });

    expect(isPlainObject(a)).toBe(true);
  });
});

describe("isPromiseLike", () => {
  it("should return true when the object is thenable", () => {
    const a = { then() {} };

    expect(isPromiseLike(a)).toBe(true);
  });

  it("should return false when the object has a then but is not a function", () => {
    const a = { then: "again" };

    expect(isPromiseLike(a)).toBe(false);
  });
});

describe("isSameValueZero", () => {
  Object.keys(primitiveValues).forEach((key: keyof typeof primitiveValues) => {
    it(`should have ${key} be equal by SameValueZero`, () => {
      expect(sameValueZeroEqual(primitiveValues[key], mainValues[key])).toBe(
        true
      );
    });
  });

  Object.keys(mainValues).forEach((key: keyof typeof mainValues) => {
    if (!Object.prototype.hasOwnProperty.call(primitiveValues, key)) {
      it(`should have ${key} be equal by SameValueZero`, () => {
        // @ts-ignore
        expect(sameValueZeroEqual(mainValues[key], mainValues[key])).toBe(true);
      });
    }
  });

  Object.keys(alternativeValues).forEach(
    (key: keyof typeof alternativeValues) => {
      if (Object.prototype.hasOwnProperty.call(mainValues, key)) {
        it(`should have ${key} not be equal by SameValueZero`, () => {
          expect(
            sameValueZeroEqual(alternativeValues[key], mainValues[key])
          ).toBe(false);
        });
      }
    }
  );
});
