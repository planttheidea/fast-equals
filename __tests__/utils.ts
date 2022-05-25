import { isPlainObject, isPromiseLike, sameValueZeroEqual } from "../src/utils";

import {
  alternativeValues,
  mainValues,
  primitiveValues,
} from "./__helpers__/dataTypes";

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
