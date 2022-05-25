describe("getNewCache", () => {
  let getNewCache: typeof import("../src/cache").getNewCache;

  it("should return a new WeakMap when support is present", () => {
    jest.isolateModules(() => {
      ({ getNewCache } = require("../src/cache"));
    });

    const cache = getNewCache();

    expect(cache).toBeInstanceOf(WeakMap);
  });

  it("should work the same with the fallback when WeakMap is not supported", () => {
    const originalWeakMap = global.WeakMap;

    global.WeakMap = undefined;

    jest.isolateModules(() => {
      ({ getNewCache } = require("../src/cache"));
    });

    const cache = getNewCache();

    expect(cache).not.toBeInstanceOf(originalWeakMap);

    const value = { foo: "bar" };

    expect(cache.get(value)).toBe(undefined);

    cache.set(value, value);

    expect(cache.get(value)).toBe(value);

    global.WeakMap = originalWeakMap;
  });
});
