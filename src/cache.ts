export interface Cache {
  delete: (key: object) => void;
  get: (key: object) => object | undefined;
  set: (key: object, value: object) => void;
}

function getNewCacheStandard(): Cache {
  return new WeakMap();
}

function getNewCacheFallback(): Cache {
  const entries: [object, object][] = [];

  return {
    delete(key: object) {
      for (let index = 0; index < entries.length; ++index) {
        if (entries[index][0] === key) {
          entries.splice(index, 1);
          return;
        }
      }
    },

    get(key: object) {
      for (let index = 0; index < entries.length; ++index) {
        if (entries[index][0] === key) {
          return entries[index][1];
        }
      }
    },

    set(key: object, value: object) {
      for (let index = 0; index < entries.length; ++index) {
        if (entries[index][0] === key) {
          entries[index][1] = value;
          return;
        }
      }

      entries.push([key, value]);
    },
  };
}

/**
 * get a new cache object to prevent circular references
 *
 * @returns the new cache object
 */
export const getNewCache =
  typeof WeakMap === "function" ? getNewCacheStandard : getNewCacheFallback;
