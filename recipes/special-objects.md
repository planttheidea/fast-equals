# Handling special (built-in) objects

The `createCustomEqual` uses `Object.prototype.toString.call()` to decide which well-known comparator to call. However,
some values might not fit either of them. For example `WeakMap` is not compared intentionally, since the values cannot
be introspected. Additionally, it's possible that new built-in objects are added to the language. Third parties might
also add custom `@@toStringTag` to their objects.

For example, the [TC39 Temporal spec](https://tc39.es/proposal-temporal/docs/) requires `@@toStringTag` being
implemented and the polyfills do that. Passing `areObjectsEqual` will not work in that scenario. Instead you'll have to
register a handler for the tag which is not supported by default.

```ts
import { createCustomEqual } from 'fast-equals';
import type { TypeEqualityComparator } from 'fast-equals';

const areZonedDateTimesEqual: TypeEqualityComparator<unknown, undefined> = (a, b) =>
  a instanceof Temporal.ZonedDateTime && b instanceof Temporal.ZonedDateTime && a.equals(b);

const isSpecialObjectEqual = createCustomEqual({
  createCustomConfig: () => ({
    getUnsupportedCustomComparator(a) {
      if (a?.[Symbol.toStringTag] === 'Temporal.ZonedDateTime') {
        return areZonedDateTimesEqual;
      }
    },
  }),
});
```
