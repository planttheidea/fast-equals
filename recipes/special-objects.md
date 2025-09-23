# Handling special (built-in) objects

The `createCustomEqual` uses `@@toStringTag` to decide which well-known comparator to call. However, some values might not fit either of them. For example `WeakMap` is compared intentionally. Additionally, it's possible that new built-in objects are added to the language. Third parties might also add `@@toStringTag` to their objects.

For example the [TC39 Temporal spec](https://tc39.es/proposal-temporal/docs/) requires `@@toStringTag` being implemetend and the polyfills do that. Passing `areObjectsEqual` will not work in that scenario. Instead you'll have to register a handler for the tag instead.

```ts
import { createCustomEqual } from 'fast-equals';
import type { TypeEqualityComparator } from 'fast-equals';

const areZonedDateTimesEqual: TypeEqualityComparator<unknown, undefined> = (
  a,
  b,
) => a instanceof Temporal.ZonedDateTime
  && b instanceof Temporal.ZonedDateTime
  && a.equals(b);

const isSpecialObjectEqual = createCustomEqual({
  createCustomConfig: () => ({
    unknownTagComparators: {
      "Temporal.ZonedDateTime", areZonedDateTimesEqual,
    }
  }),
});
```
