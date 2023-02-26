# fast-equals

<img src="https://img.shields.io/badge/build-passing-brightgreen.svg"/>
<img src="https://img.shields.io/badge/coverage-100%25-brightgreen.svg"/>
<img src="https://img.shields.io/badge/license-MIT-blue.svg"/>

Perform [blazing fast](#benchmarks) equality comparisons (either deep or shallow) on two objects passed. It has no dependencies, and is ~1.74kB when minified and gzipped.

Unlike most equality validation libraries, the following types are handled out-of-the-box:

- `NaN`
- `Date` objects
- `RegExp` objects
- `Map` / `Set` iterables
- `Promise` objects
- `react` elements

Circular object and strict comparisons are supported, as is creation of a custom equality comparator for specific use-cases.

## Table of contents

- [fast-equals](#fast-equals)
  - [Table of contents](#table-of-contents)
  - [Usage](#usage)
    - [Specific builds](#specific-builds)
  - [Available methods](#available-methods)
    - [deepEqual](#deepequal)
      - [Comparing `Map`s](#comparing-maps)
    - [shallowEqual](#shallowequal)
    - [sameValueZeroEqual](#samevaluezeroequal)
    - [circularDeepEqual](#circulardeepequal)
    - [circularShallowEqual](#circularshallowequal)
    - [strictDeepEqual](#strictdeepequal)
    - [strictShallowEqual](#strictshallowequal)
    - [strictCircularDeepEqual](#strictcirculardeepequal)
    - [strictCircularShallowEqual](#strictcircularshallowequal)
    - [createCustomEqual](#createcustomequal)
      - [Recipes](#recipes)
  - [Benchmarks](#benchmarks)
  - [Development](#development)

## Usage

```ts
import { deepEqual } from 'fast-equals';

console.log(deepEqual({ foo: 'bar' }, { foo: 'bar' })); // true
```

### Specific builds

By default, npm should resolve the correct build of the package based on your consumption (ESM vs CommonJS). However, if you want to force use of a specific build, they can be located here:

- ESM => `fast-equals/dist/esm/index.mjs`
- CommonJS => `fast-equals/dist/cjs/index.cjs`
- UMD => `fast-equals/dist/umd/index.js`
- Minified UMD => `fast-equals/dist/min/index.js`

If you are having issues loading a specific build type, [please file an issue](https://github.com/planttheidea/fast-equals/issues).

## Available methods

### deepEqual

Performs a deep equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

```ts
import { deepEqual } from 'fast-equals';

const objectA = { foo: { bar: 'baz' } };
const objectB = { foo: { bar: 'baz' } };

console.log(objectA === objectB); // false
console.log(deepEqual(objectA, objectB)); // true
```

#### Comparing `Map`s

`Map` objects support complex keys (objects, Arrays, etc.), however [the spec for key lookups in `Map` are based on `SameZeroValue`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#key_equality). If the spec were followed for comparison, the following would always be `false`:

```ts
const mapA = new Map([[{ foo: 'bar' }, { baz: 'quz' }]]);
const mapB = new Map([[{ foo: 'bar' }, { baz: 'quz' }]]);

deepEqual(mapA, mapB);
```

To support true deep equality of all contents, `fast-equals` will perform a deep equality comparison for key and value parirs. Therefore, the above would be `true`.

### shallowEqual

Performs a shallow equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

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

### sameValueZeroEqual

Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero) comparison on the two objects passed and returns a boolean representing the value equivalency of the objects. In simple terms, this means either strictly equal or both `NaN`.

```ts
import { sameValueZeroEqual } from 'fast-equals';

const mainObject = { foo: NaN, bar: 'baz' };

const objectA = 'baz';
const objectB = NaN;
const objectC = { foo: NaN, bar: 'baz' };

console.log(sameValueZeroEqual(mainObject.bar, objectA)); // true
console.log(sameValueZeroEqual(mainObject.foo, objectB)); // true
console.log(sameValueZeroEqual(mainObject, objectC)); // false
```

### circularDeepEqual

Performs the same comparison as `deepEqual` but supports circular objects. It is slower than `deepEqual`, so only use if you know circular objects are present.

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

Performs the same comparison as `shallowequal` but supports circular objects. It is slower than `shallowEqual`, so only use if you know circular objects are present.

```ts
const array = ['foo'];

array.push(array);

console.log(circularShallowEqual(array, ['foo', array])); // true
console.log(circularShallowEqual(array, [array])); // false
```

### strictDeepEqual

Performs the same comparison as `deepEqual` but performs a strict comparison of the objects. In this includes:

- Checking constructors match
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

Performs the same comparison as `circularShallowEqual` but performs a strict comparison of the objects. In this includes:

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

Creates a custom equality comparator that will be used on nested values in the object. Unlike `deepEqual` and `shallowEqual`, this is a factory method that receives the default options used internally, and allows you to override the defaults as needed. This is generally for extreme edge-cases, or supporting legacy environments.

The signature is as follows:

```ts
interface BaseCircular extends Pick<WeakMap<any, any>, 'delete' | 'get'> {
  set(key: object, value: any): any;
}

interface DefaultState<Meta> {
  readonly cache: undefined | BaseCircular;
  readonly equals: InternalEqualityComparator<Meta>;
  meta: Meta;
  readonly strict: boolean;
}

type EqualityComparator<Meta> = <A, B>(
  a: A,
  b: B,
  state: State<Meta>,
) => boolean;

interface CreateComparatorCreatorOptions<Meta> {
  areArraysEqual: TypeEqualityComparator<any[], Meta>;
  areDatesEqual: TypeEqualityComparator<Date, Meta>;
  areMapsEqual: TypeEqualityComparator<Map<any, any>, Meta>;
  areObjectsEqual: TypeEqualityComparator<Record<string, any>, Meta>;
  arePrimitiveWrappersEqual: TypeEqualityComparator<
    boolean | string | number,
    Meta
  >;
  areRegExpsEqual: TypeEqualityComparator<RegExp, Meta>;
  areSetsEqual: TypeEqualityComparator<Set<any>, Meta>;
  areTypedArraysEqual: TypeEqualityComparatory<TypedArray, Meta>;
}

interface CustomEqualCreatorOptions<Meta> {
  circular?: boolean;
  comparator?: EqualityComparator<Meta>;
  createCustomConfig?: CreateCustomComparatorConfig<Meta>;
  createInternalComparator?: <Meta>(
    compare: EqualityComparator<Meta>,
  ) => InternalEqualityComparator<Meta>;
  createState?: CreateState<Meta>;
  strict?: boolean;
}

function createCustomEqual(
  options: CustomEqualCreatorOptions<Meta>,
): <A, B>(a: A, b: B, metaOverride?: Meta) => boolean;
```

Create a custom equality comparator. This allows complete control over building a bespoke equality method, in case your use-case requires a higher degree of performance, legacy environment support, or any other non-standard usage. The [recipes](#recipes) provide examples of use in different use-cases, but if you have a specific goal in mind and would like assistance feel free to [file an issue](https://github.com/planttheidea/fast-equals/issues).

_**NOTE**: `Map` implementations compare equality for both keys and value. When using a custom comparator and comparing equality of the keys, the iteration index is provided as both `indexOrKeyA` and `indexOrKeyB` to help use-cases where ordering of keys matters to equality._

#### Recipes

Some recipes have been created to provide examples of use-cases for `createCustomEqual`. Even if not directly applicable to the problem you are solving, they can offer guidance of how to structure your solution.

- [Legacy environment support for `RegExp` comparators](./recipes/legacy-regexp-support.md)
- [Explicit property check](./recipes/explicit-property-check.md)
- [Using `meta` in comparison](./recipes//using-meta-in-comparison.md)
- [Comparing non-standard properties](./recipes/non-standard-properties.md)
- [Strict property descriptor comparison](./recipes/strict-property-descriptor-check.md)
- [Legacy environment support for circualr equal comparators](./recipes/legacy-circular-equal-support.md)

## Benchmarks

All benchmarks were performed on an i7-8650U Ubuntu Linux laptop with 24GB of memory using NodeJS version `12.19.1`, and are based on averages of running comparisons based deep equality on the following object types:

- Primitives (`String`, `Number`, `null`, `undefined`)
- `Function`
- `Object`
- `Array`
- `Date`
- `RegExp`
- `react` elements
- A mixed object with a combination of all the above types

|                            | Operations / second |
| -------------------------- | ------------------- |
| **fast-equals**            | **153,880**         |
| fast-deep-equal            | 144,035             |
| react-fast-compare         | 130,324             |
| nano-equal                 | 104,624             |
| **fast-equals (circular)** | **97,610**          |
| shallow-equal-fuzzy        | 83,946              |
| underscore.isEqual         | 47,370              |
| lodash.isEqual             | 25,053              |
| deep-eql                   | 22,146              |
| assert.deepStrictEqual     | 532                 |
| deep-equal                 | 209                 |

Caveats that impact the benchmark (and accuracy of comparison):

- `Map`s, `Promise`s, and `Set`s were excluded from the benchmark entirely because no library other than `deep-eql` fully supported their comparison
- `assert.deepStrictEqual` does not support `NaN` or `SameValueZero` equality for dates
- `deep-eql` does not support `SameValueZero` equality for zero equality (positive and negative zero are not equal)
- `deep-equal` does not support `NaN` and does not strictly compare object type, or date / regexp values, nor uses `SameValueZero` equality for dates
- `fast-deep-equal` does not support `NaN` or `SameValueZero` equality for dates
- `nano-equal` does not strictly compare object property structure, array length, or object type, nor `SameValueZero` equality for dates
- `react-fast-compare` does not support `NaN` or `SameValueZero` equality for dates, and does not compare `function` equality
- `shallow-equal-fuzzy` does not strictly compare object type or regexp values, nor `SameValueZero` equality for dates
- `underscore.isEqual` does not support `SameValueZero` equality for primitives or dates

All of these have the potential of inflating the respective library's numbers in comparison to `fast-equals`, but it was the closest apples-to-apples comparison I could create of a reasonable sample size. It should be noted that `react` elements can be circular objects, however simple elements are not; I kept the `react` comparison very basic to allow it to be included.

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

- benchmark => run benchmark tests against other equality libraries
- build => build `main`, `module`, and `browser` distributables with `rollup`
- clean => run `rimraf` on the `dist` folder
- dev => start webpack playground App
- dist => run `build`
- lint => run ESLint on all files in `src` folder (also runs on `dev` script)
- lint:fix => run `lint` script, but with auto-fixer
- prepublish:compile => run `lint`, `test:coverage`, `transpile:lib`, `transpile:es`, and `dist` scripts
- start => run `dev`
- test => run AVA with NODE_ENV=test on all files in `test` folder
- test:coverage => run same script as `test` with code coverage calculation via `nyc`
- test:watch => run same script as `test` but keep persistent watcher
