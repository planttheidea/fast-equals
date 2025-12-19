# Non-standard properties

Sometimes, objects require a comparison that extend beyond its own keys, or even its own properties or symbols. Using a
custom object comparator with `createCustomEqual` allows these kinds of comparisons.

```ts
import { createCustomEqual } from 'fast-equals';
import type { EqualityComparator } from 'fast-equals';

const hiddenReferences = new WeakMap();

class HiddenProperty {
  hidden!: string;
  visible: boolean;

  constructor(value: string) {
    this.visible = true;

    hiddenReferences.set(this, value);
  }
}

HiddenProperty.prototype.hidden = 'foo';

function createAreObjectsEqual<AreObjectsEqual extends EqualityComparator<any>>(
  areObjectsEqual: AreObjectsEqual,
): AreObjectsEqual {
  return function (a, b, state) {
    if (!areObjectsEqual(a, b, state)) {
      return false;
    }

    const aInstance = a instanceof HiddenProperty;
    const bInstance = b instanceof HiddenProperty;

    if (aInstance || bInstance) {
      return (
        aInstance
        && bInstance
        && a.hidden === 'foo'
        && b.hidden === 'foo'
        && hiddenReferences.get(a) === hiddenReferences.get(b)
      );
    }

    return true;
  };
}

const deepEqual = createCustomEqual({
  createCustomConfig: ({ areObjectsEqual }) => ({
    areObjectsEqual: createAreObjectsEqual(areObjectsEqual),
  }),
});
```
