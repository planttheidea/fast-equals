> fast-equals

Perform [blazing fast](#benchmarks) equality comparisons between two objects, while also allowing for flexibility for
various use-cases. It has no dependencies, and is ~2kB when minified and gzipped.

The following types are handled out-of-the-box:

- Plain objects (including `react` elements and `Arguments`)
- Arrays
- `ArrayBuffer` / `TypedArray` / `DataView` instances
- `Date` objects
- `RegExp` objects
- `Map` / `Set` iterables
- `Promise` objects and then-ables
- Primitive wrappers (`new Boolean()` / `new Number()` / `new String()`)
- Custom class instances, including subclasses of native classes

Methods are available for deep, shallow, [`SameValue`](http://ecma-international.org/ecma-262/7.0/#sec-samevalue),
[`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero), or
[strict equality](https://262.ecma-international.org/7.0/#sec-strict-equality-comparison) comparison. In addition, you
can opt into support for circular objects, or performing a "strict" comparison with unconventional property definition,
or both. You can also customize any specific type comparison based on your application's use-cases.

By default, npm should resolve the correct build of the package based on your consumption (ESM vs CommonJS). However, if
you want to force use of a specific build, they can be located here:

- ESM => `fast-equals/dist/es/index.mjs`
- CommonJS => `fast-equals/dist/cjs/index.cjs`

If you are having any problems, want to request a new feature, or have any questions,
[please file an issue](https://github.com/planttheidea/fast-equals/issues).

- [Usage](#usage)
- [Available methods](#available-methods)
  - [deepEqual](#deepequal)
    - [Comparing `Map`s](#comparing-maps)
  - [shallowEqual](#shallowequal)
  - [sameValueEqual](#samevalueequal)
  - [sameValueZeroEqual](#samevaluezeroequal)
  - [strictEqual](#strictequal)
  - [circularDeepEqual](#circulardeepequal)
  - [circularShallowEqual](#circularshallowequal)
  - [strictDeepEqual](#strictdeepequal)
  - [strictShallowEqual](#strictshallowequal)
  - [strictCircularDeepEqual](#strictcirculardeepequal)
  - [strictCircularShallowEqual](#strictcircularshallowequal)
  - [createCustomEqual](#createcustomequal)
    - [getUnsupportedCustomComparator](#getunsupportedcustomcomparator)
    - [Recipes](#recipes)
- [Benchmarks](#benchmarks)

## Usage

```ts
import { deepEqual } from 'fast-equals';

console.log(deepEqual({ foo: 'bar' }, { foo: 'bar' })); // true
```

## Available methods

### deepEqual

Performs a deep equality comparison on the two objects passed and returns a boolean representing the value equivalency
of the objects.

```ts
import { deepEqual } from 'fast-equals';

const objectA = { foo: { bar: 'baz' } };
const objectB = { foo: { bar: 'baz' } };

console.log(objectA === objectB); // false
console.log(deepEqual(objectA, objectB)); // true
```

#### Comparing `Map`s

`Map` objects support complex keys (objects, Arrays, etc.), however
[the spec for key lookups in `Map` are based on `SameZeroValue`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#key_equality).
If the spec were followed for comparison, the following would always be `false`:

```ts
const mapA = new Map([[{ foo: 'bar' }, { baz: 'quz' }]]);
const mapB = new Map([[{ foo: 'bar' }, { baz: 'quz' }]]);

deepEqual(mapA, mapB);
```

To support true deep equality of all contents, `fast-equals` will perform a deep equality comparison for key and value
pairs. Therefore, the above would be `true`.

### shallowEqual

Performs a shallow equality comparison on the two objects passed and returns a boolean representing the value
equivalency of the objects.

```ts
import { shallowEqual } from 'fast-equals';

const nestedObject = { bar: 'baz' };

const objectA = { foo: nestedObject };
const objectB = { foo: nestedObject };
const objectC = { foo: { bar: 'baz' } };

console.log(objectA === objectB); // false
console.log(shallowEqual(objectA, objectB)); // true
console.log(shallowEqual(objectA, objectC)); // false
```

### sameValueEqual

Performs a [`SameValue`](http://ecma-international.org/ecma-262/7.0/#sec-samevalue) comparison on the two objects passed
and returns a boolean representing the value equivalency of the objects. In simple terms, this means:

- `+0` and `-0` are not equal
- `NaN` is equal to `NaN`
- All other items are based on referential equality (`a === b`)

```ts
import { sameValueEqual } from 'fast-equals';

const mainObject = { foo: NaN, bar: 'baz' };

const objectA = 'baz';
const objectB = NaN;
const objectC = { foo: NaN, bar: 'baz' };

console.log(sameValueEqual(mainObject.bar, objectA)); // true
console.log(sameValueEqual(mainObject.foo, objectB)); // true
console.log(sameValueEqual(mainObject, objectC)); // false
```

_**NOTE**: In environments that support
[`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is),
`sameValueEqual` is just a re-export of that method._

### sameValueZeroEqual

Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero) comparison on the two
objects passed and returns a boolean representing the value equivalency of the objects. In simple terms, this means:

- `+0` and `-0` are equal
- `NaN` is equal to `NaN`
- All other items are based on referential equality (`a === b`)

```ts
import { sameValueEqual } from 'fast-equals';

const mainObject = { foo: NaN, bar: 'baz' };

const objectA = 'baz';
const objectB = NaN;
const objectC = { foo: NaN, bar: 'baz' };

console.log(sameValueEqual(mainObject.bar, objectA)); // true
console.log(sameValueEqual(mainObject.foo, objectB)); // true
console.log(sameValueEqual(mainObject, objectC)); // false
```

### strictEqual

Performs a [Strict Equality](https://262.ecma-international.org/7.0/#sec-strict-equality-comparison) comparison on the
two objects passed and returns a boolean representing the referential equality of the objects. In simple terms, this
means:

- `+0` and `-0` are equal
- `NaN` is not equal to `NaN`
- All other items are based on referential equality (`a === b`)

```ts
import { strictEqual } from 'fast-equals';

const mainObject = { foo: NaN, bar: 'baz' };

const objectA = 'baz';
const objectB = NaN;
const objectC = { foo: NaN, bar: 'baz' };

console.log(sameValueEqual(mainObject.bar, objectA)); // true
console.log(sameValueEqual(mainObject.foo, objectB)); // false
console.log(sameValueEqual(mainObject, objectC)); // false
```

_**NOTE**: This is mainly a convenience function, such as needing a default functional equality comparator. Naturally,
it is faster to simply compare `a === b`. :)_

### circularDeepEqual

Performs the same comparison as `deepEqual` but supports circular objects. It is slower than `deepEqual`, so only use if
you know circular objects are present.

```ts
function Circular(value) {
  this.me = {
    deeply: {
      nested: {
        reference: this,
      },
    },
    value,
  };
}

console.log(circularDeepEqual(new Circular('foo'), new Circular('foo'))); // true
console.log(circularDeepEqual(new Circular('foo'), new Circular('bar'))); // false
```

Just as with `deepEqual`, [both keys and values are compared for deep equality](#comparing-maps).

### circularShallowEqual

Performs the same comparison as `shallowequal` but supports circular objects. It is slower than `shallowEqual`, so only
use if you know circular objects are present.

```ts
const array = ['foo'];

array.push(array);

console.log(circularShallowEqual(array, ['foo', array])); // true
console.log(circularShallowEqual(array, [array])); // false
```

### strictDeepEqual

Performs the same comparison as `deepEqual` but performs a strict comparison of the objects. In this includes:

- Checking symbol properties
- Checking non-enumerable properties in object comparisons
- Checking full descriptor of properties on the object to match
- Checking non-index properties on arrays
- Checking non-key properties on `Map` / `Set` objects

```ts
const array = [{ foo: 'bar' }];
const otherArray = [{ foo: 'bar' }];

array.bar = 'baz';
otherArray.bar = 'baz';

console.log(strictDeepEqual(array, otherArray)); // true;
console.log(strictDeepEqual(array, [{ foo: 'bar' }])); // false;
```

### strictShallowEqual

Performs the same comparison as `shallowEqual` but performs a strict comparison of the objects. In this includes:

- Checking non-enumerable properties in object comparisons
- Checking full descriptor of properties on the object to match
- Checking non-index properties on arrays
- Checking non-key properties on `Map` / `Set` objects

```ts
const array = ['foo'];
const otherArray = ['foo'];

array.bar = 'baz';
otherArray.bar = 'baz';

console.log(strictDeepEqual(array, otherArray)); // true;
console.log(strictDeepEqual(array, ['foo'])); // false;
```

### strictCircularDeepEqual

Performs the same comparison as `circularDeepEqual` but performs a strict comparison of the objects. In this includes:

- Checking `Symbol` properties on the object
- Checking non-enumerable properties in object comparisons
- Checking full descriptor of properties on the object to match
- Checking non-index properties on arrays
- Checking non-key properties on `Map` / `Set` objects

```ts
function Circular(value) {
  this.me = {
    deeply: {
      nested: {
        reference: this,
      },
    },
    value,
  };
}

const first = new Circular('foo');

Object.defineProperty(first, 'bar', {
  enumerable: false,
  value: 'baz',
});

const second = new Circular('foo');

Object.defineProperty(second, 'bar', {
  enumerable: false,
  value: 'baz',
});

console.log(circularDeepEqual(first, second)); // true
console.log(circularDeepEqual(first, new Circular('foo'))); // false
```

### strictCircularShallowEqual

Performs the same comparison as `circularShallowEqual` but performs a strict comparison of the objects. In this
includes:

- Checking non-enumerable properties in object comparisons
- Checking full descriptor of properties on the object to match
- Checking non-index properties on arrays
- Checking non-key properties on `Map` / `Set` objects

```ts
const array = ['foo'];
const otherArray = ['foo'];

array.push(array);
otherArray.push(otherArray);

array.bar = 'baz';
otherArray.bar = 'baz';

console.log(circularShallowEqual(array, otherArray)); // true
console.log(circularShallowEqual(array, ['foo', array])); // false
```

### createCustomEqual

Creates a custom equality comparator that will be used on nested values in the object. Unlike `deepEqual` and
`shallowEqual`, this is a factory method that receives the default options used internally, and allows you to override
the defaults as needed. This is generally for extreme edge-cases, or supporting legacy environments.

The signature is as follows:

```ts
interface Cache<Key extends object, Value> {
  delete(key: Key): boolean;
  get(key: Key): Value | undefined;
  set(key: Key, value: any): any;
}

interface ComparatorConfig<Meta> {
  areArrayBuffersEqual: EqualityComparator<Meta>;
  areArraysEqual: EqualityComparator<Meta>;
  areDataViewsEqual: EqualityComparator<Meta>;
  areDatesEqual: EqualityComparator<Meta>;
  areErrorsEqual: EqualityComparator<Meta>;
  areFunctionsEqual: EqualityComparator<Meta>;
  areMapsEqual: EqualityComparator<Meta>;
  areNumbersEqual: EqualityComparator<Meta>;
  areObjectsEqual: EqualityComparator<Meta>;
  arePrimitiveWrappersEqual: EqualityComparator<Meta>;
  areRegExpsEqual: EqualityComparator<Meta>;
  areSetsEqual: EqualityComparator<Meta>;
  areTypedArraysEqual: EqualityComparator<Meta>;
  areUrlsEqual: EqualityComparator<Meta>;
  getUnsupportedCustomComparator: <Type>(a: Type, b: Type, state: State<Meta>, tag: string) => EqualityComparator<Meta>;
}

function createCustomEqual<Meta>(options: {
  circular?: boolean;
  createCustomConfig?: (defaultConfig: ComparatorConfig<Meta>) => Partial<ComparatorConfig<Meta>>;
  createInternalComparator?: (
    compare: <A, B>(a: A, b: B, state: State<Meta>) => boolean,
  ) => (a: any, b: any, indexOrKeyA: any, indexOrKeyB: any, parentA: any, parentB: any, state: State<Meta>) => boolean;
  createState?: () => { cache?: Cache; meta?: Meta };
  strict?: boolean;
}): <A, B>(a: A, b: B) => boolean;
```

Create a custom equality comparator. This allows complete control over building a bespoke equality method, in case your
use-case requires a higher degree of performance, legacy environment support, or any other non-standard usage. The
[recipes](#recipes) provide examples of use in different use-cases, but if you have a specific goal in mind and would
like assistance feel free to [file an issue](https://github.com/planttheidea/fast-equals/issues).

_**NOTE**: `Map` implementations compare equality for both keys and value. When using a custom comparator and comparing
equality of the keys, the iteration index is provided as both `indexOrKeyA` and `indexOrKeyB` to help use-cases where
ordering of keys matters to equality._

#### getUnsupportedCustomComparator

If you want to compare objects that have a custom `@@toStringTag`, you can provide a map of the custom tags you want to
support via the `getUnsupportedCustomComparator` option. See [this recipe]('./recipes/special-objects.md) for an
example.

#### Recipes

Some recipes have been created to provide examples of use-cases for `createCustomEqual`. Even if not directly applicable
to the problem you are solving, they can offer guidance of how to structure your solution.

- [Legacy environment support for `RegExp` comparators](./recipes/legacy-regexp-support.md)
- [Explicit property check](./recipes/explicit-property-check.md)
- [Using `meta` in comparison](./recipes//using-meta-in-comparison.md)
- [Comparing non-standard properties](./recipes/non-standard-properties.md)
- [Strict property descriptor comparison](./recipes/strict-property-descriptor-check.md)
- [Legacy environment support for circular equal comparators](./recipes/legacy-circular-equal-support.md)
- [Custom comparator support](./recipes/special-objects.md)

## Benchmarks

All benchmarks were performed on an i9-11900H Ubuntu Linux 24.04 laptop with 64GB of memory using NodeJS version
`24.11.1`, and are based on averages of running comparisons based deep equality on the following object types:

- Primitives (`String`, `Number`, `null`, `undefined`)
- `Function`
- `Object`
- `Array`
- `Date`
- `RegExp`
- `react` elements
- A mixed object with a combination of all the above types

```bash
┌────────────────────────────────────────┬────────────────┐
│ Name                                   │ Ops / sec      │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (passed)                   │ 1544237.29413  │
├────────────────────────────────────────┼────────────────┤
│ fast-deep-equal (passed)               │ 1328583.767745 │
├────────────────────────────────────────┼────────────────┤
│ react-fast-compare (passed)            │ 1301727.296375 │
├────────────────────────────────────────┼────────────────┤
│ shallow-equal-fuzzy (passed)           │ 1225981.400919 │
├────────────────────────────────────────┼────────────────┤
│ nano-equal (failed)                    │ 969495.538753  │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (circular) (passed)        │ 813716.49516   │
├────────────────────────────────────────┼────────────────┤
│ dequal/lite (passed)                   │ 780805.627339  │
├────────────────────────────────────────┼────────────────┤
│ dequal (passed)                        │ 767208.995048  │
├────────────────────────────────────────┼────────────────┤
│ underscore.isEqual (passed)            │ 490695.830468  │
├────────────────────────────────────────┼────────────────┤
│ assert.deepStrictEqual (passed)        │ 471011.425391  │
├────────────────────────────────────────┼────────────────┤
│ lodash.isEqual (passed)                │ 296064.057382  │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (strict) (passed)          │ 225894.800964  │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (strict circular) (passed) │ 195657.732354  │
├────────────────────────────────────────┼────────────────┤
│ deep-eql (passed)                      │ 162718.102328  │
├────────────────────────────────────────┼────────────────┤
│ deep-equal (passed)                    │ 954.172311     │
└────────────────────────────────────────┴────────────────┘

Testing mixed objects not equal...
┌────────────────────────────────────────┬────────────────┐
│ Name                                   │ Ops / sec      │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (passed)                   │ 5112341.000979 │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (circular) (passed)        │ 3501225.300307 │
├────────────────────────────────────────┼────────────────┤
│ fast-deep-equal (passed)               │ 3471838.735181 │
├────────────────────────────────────────┼────────────────┤
│ react-fast-compare (passed)            │ 3439612.908273 │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (strict) (passed)          │ 1797319.423491 │
├────────────────────────────────────────┼────────────────┤
│ fast-equals (strict circular) (passed) │ 1534168.229167 │
├────────────────────────────────────────┼────────────────┤
│ dequal/lite (passed)                   │ 1357981.758571 │
├────────────────────────────────────────┼────────────────┤
│ dequal (passed)                        │ 1328078.173967 │
├────────────────────────────────────────┼────────────────┤
│ shallow-equal-fuzzy (failed)           │ 1224747.272118 │
├────────────────────────────────────────┼────────────────┤
│ nano-equal (passed)                    │ 1087373.99615  │
├────────────────────────────────────────┼────────────────┤
│ underscore.isEqual (passed)            │ 927298.592729  │
├────────────────────────────────────────┼────────────────┤
│ lodash.isEqual (passed)                │ 387294.235476  │
├────────────────────────────────────────┼────────────────┤
│ deep-eql (passed)                      │ 186028.168827  │
├────────────────────────────────────────┼────────────────┤
│ assert.deepStrictEqual (passed)        │ 21261.312424   │
├────────────────────────────────────────┼────────────────┤
│ deep-equal (passed)                    │ 3782.329948    │
└────────────────────────────────────────┴────────────────┘
```

Caveats that impact the benchmark (and accuracy of comparison):

- `Map`s, `Promise`s, and `Set`s were excluded from the benchmark entirely because no library other than `deep-eql`
  fully supported their comparison
- `fast-deep-equal`, `react-fast-compare` and `nano-equal` throw on objects with `null` as prototype
  (`Object.create(null)`)
- `assert.deepStrictEqual` does not support `NaN` or `SameValue` equality for dates
- `deep-eql` does not support `SameValue` equality for zero equality (positive and negative zero are not equal)
- `deep-equal` does not support `NaN` and does not strictly compare object type, or date / regexp values, nor uses
  `SameValue` equality for dates
- `fast-deep-equal` does not support `NaN` or `SameValue` equality for dates
- `nano-equal` does not strictly compare object property structure, array length, or object type, nor `SameValue`
  equality for dates
- `react-fast-compare` does not support `NaN` or `SameValue` equality for dates, and does not compare `function`
  equality
- `shallow-equal-fuzzy` does not strictly compare object type or regexp values, nor `SameValue` equality for dates
- `underscore.isEqual` does not support `SameValue` equality for primitives or dates

All of these have the potential of inflating the respective library's numbers in comparison to `fast-equals`, but it was
the closest apples-to-apples comparison I could create of a reasonable sample size. It should be noted that `react`
elements can be circular objects, however simple elements are not; I kept the `react` comparison very basic to allow it
to be included.
