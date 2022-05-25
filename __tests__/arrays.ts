import { areArraysEqual } from "../src/arrays";
import { sameValueZeroEqual } from "../src/utils";

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
