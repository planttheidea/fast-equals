# Non-standard properties

Sometimes, objects require a comparison that extend beyond its own keys, or even its own properties or symbols. Using a custom object comparator with `createCustomEqual` allows these kinds of comparisons.

```ts
import { createCustomEqual } from 'fast-equals';
import type { TypeEqualityComparator } from 'fast-equals';

class HiddenProperty {
  visible: boolean;
  #hidden: string;

  constructor(value: string) {
    this.visible = true;
    this.#hidden = value;
  }

  get hidden() {
    return this.#hidden;
  }
}

function createAreObjectsEqual(
  areObjectsEqual: TypeEqualityComparator<Record<any, any>, undefined>,
): TypeEqualityComparator<Record<any, any>, undefined> {
  return function (a, b, state) {
    if (!areObjectsEqual(a, b, state)) {
      return false;
    }

    const aInstance = a instanceof HiddenProperty;
    const bInstance = b instanceof HiddenProperty;

    if (aInstance || bInstance) {
      return aInstance && bInstance && a.hidden === b.hidden;
    }

    return true;
  };
}

const deepEqual = createCustomEqual({
  createCustomConfig: ({ areObjectsEqual }) =>
    createAreObjectsEqual(areObjectsEqual),
});
```
