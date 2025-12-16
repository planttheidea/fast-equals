# Handling special (custom) objects

The standard equality comparators use `Object.prototype.toString.call()` to decide which well-known comparator to call.
However, some values might not work for this check. Examples:

- Provide an explicit comparison for unhandled items, such as `WeakMap`
- Support class instances with a custom `Symbol.toStringTag` value
- Support polyfills / new built-in objects for proposals to the language

In that case, you can leverage `createCustomEqual` with the `getUnsupportedCustomComparator` handler to create your own
equality comparators for those unsupported values.

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
