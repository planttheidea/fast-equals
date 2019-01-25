# fast-equals

<img src="https://img.shields.io/badge/build-passing-brightgreen.svg"/>
<img src="https://img.shields.io/badge/coverage-100%25-brightgreen.svg"/>
<img src="https://img.shields.io/badge/license-MIT-blue.svg"/>

Perform [blazing fast](#benchmarks) equality comparisons (either deep or shallow) on two objects passed. It has no dependencies, and is ~1.3kB when minified and gzipped.

Unlike most equality validation libraries, the following types are handled out-of-the-box:

- `NaN`
- `Date` objects
- `RegExp` objects
- `Map` / `Set` iterables
- `Promise` objects
- `react` elements

Starting with version `1.5.0`, circular objects are supported for both deep and shallow equality (see [`circularDeepEqual`](#circulardeepequal) and [`circularShallowEqual`](#circularshallowequal)). You can also create a custom nested comparator, for specific scenarios ([see below](#createcustomequal)).

## Table of contents

- [Usage](#usage)
- [Importing](#importing)
- [Available methods](#available-methods)
  - [deepEqual](#deepequal)
  - [shallowEqual](#shallowequal)
  - [sameValueZeroEqual](#samevaluezeroequal)
  - [circularDeepEqual](#circulardeepequal)
  - [circularShallowEqual](#circularshallowequal)
  - [createCustomEqual](#createcustomequal)
- [Benchmarks](#benchmarks)
- [Development](#development)

## Usage

You can either import the full object:

```javascript
import fe from "fast-equals";

console.log(fe.deep({ foo: "bar" }, { foo: "bar" })); // true
```

Or the individual imports desired:

```javascript
import { deepEqual } from "fast-equals";

console.log(deepEqual({ foo: "bar" }, { foo: "bar" })); // true
```

## Importing

ESM in browsers:

```javascript
import fe from "fast-equals";
```

ESM in NodeJS:

```javascript
import fe from "fast-equals/mjs";
```

CommonJS:

```javascript
const fe = require("fast-equals").default;
```

## Available methods

#### deepEqual

_Aliased on the default export as `fe.deep`_

Performs a deep equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

```javascript
import { deepEqual } from "fast-equals";

const objectA = { foo: { bar: "baz" } };
const objectB = { foo: { bar: "baz" } };

console.log(objectA === objectB); // false
console.log(deepEqual(objectA, objectB)); // true
```

#### shallowEqual

_Aliased on the default export as `fe.shallow`_

Performs a shallow equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

```javascript
import { shallowEqual } from "fast-equals";

const nestedObject = { bar: "baz" };

const objectA = { foo: nestedObject };
const objectB = { foo: nestedObject };
const objectC = { foo: { bar: "baz" } };

console.log(objectA === objectB); // false
console.log(shallowEqual(objectA, objectB)); // true
console.log(shallowEqual(objectA, objectC)); // false
```

#### sameValueZeroEqual

_Aliased on the default export as `fe.sameValueZero`_

Performs a [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero) comparison on the two objects passed and returns a boolean representing the value equivalency of the objects. In simple terms, this means either strictly equal or both `NaN`.

```javascript
import { sameValueZeroEqual } from "fast-equals";

const mainObject = { foo: NaN, bar: "baz" };

const objectA = "baz";
const objectB = NaN;
const objectC = { foo: NaN, bar: "baz" };

console.log(sameValueZeroEqual(mainObject.bar, objectA)); // true
console.log(sameValueZeroEqual(mainObject.foo, objectB)); // true
console.log(sameValueZeroEqual(mainObject, objectC)); // false
```

#### circularDeepEqual

_Aliased on the default export as `fe.circularDeep`_

Performs the same comparison as `deepEqual` but supports circular objects. It is slower than `deepEqual`, so only use if you know circular objects are present.

```javascript
function Circular(value) {
  this.me = {
    deeply: {
      nested: {
        reference: this
      }
    },
    value
  };
}

console.log(circularDeepEqual(new Circular("foo"), new Circular("foo"))); // true
console.log(circularDeepEqual(new Circular("foo"), new Circular("bar"))); // false
```

#### circularShallowEqual

_Aliased on the default export as `fe.circularShallow`_

Performs the same comparison as `shallowequal` but supports circular objects. It is slower than `shallowEqual`, so only use if you know circular objects are present.

```javascript
const array = ["foo"];

array.push(array);

console.log(circularShallowEqual(array, ["foo", array])); // true
console.log(circularShallowEqual(array, [array])); // false
```

#### createCustomEqual

_Aliased on the default export as `fe.createCustom`_

Creates a custom equality comparator that will be used on nested values in the object. Unlike `deepEqual` and `shallowEqual`, this is a partial-application function that will receive the internal comparator and should return a function that compares two objects.

The signature is as follows:

```javascript
createCustomEqual(deepEqual: function) => (objectA: any, objectB: any, meta: any) => boolean;
```

The `meta` parameter is whatever you want it to be. It will be passed through to all equality checks, and is meant specifically for use with custom equality methods. For example, with the `circularDeepEqual` and `circularShallowEqual` methods, it is used to pass through a cache of processed objects.

An example for a custom equality comparison that also checks against values in the meta object:

```javascript
import { createCustomEqual } from "fast-equals";

const isDeepEqualOrFooMatchesMeta = createCustomEqual(deepEqual => {
  return (objectA, objectB, meta) => {
    return (
      objectA.foo === meta ||
      objectB.foo === meta ||
      deepEqual(objectA, objectB, meta)
    );
  };
});

const objectA = { foo: "bar" };
const objectB = { foo: "baz" };
const meta = "bar";

console.log(isDeepEqualOrFooMatchesMeta(objectA, objectB)); // true
```

## Benchmarks

All benchmarks were performed on an i7 8-core Arch Linux laptop with 16GB of memory using NodeJS version `10.15.0`, and are based on averages of running comparisons based deep equality on the following object types:

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
| **fast-equals**            | **148,083**         |
| nano-equal                 | 114,146             |
| shallow-equal-fuzzy        | 99,097              |
| fast-deep-equal            | 98,452              |
| react-fast-compare         | 96,650              |
| **fast-equals (circular)** | **80,575**          |
| underscore.isEqual         | 62,572              |
| deep-equal                 | 47,260              |
| lodash.isEqual             | 24,315              |
| deep-eql                   | 23,962              |
| assert.deepStrictEqual     | 1,370               |

Caveats that impact the benchmark (and accuracy of comparison):

- `nano-equal` does not strictly compare object property structure, array length, or object type, nor `SameValueZero` equality for dates
- `shallow-equal-fuzzy` does not strictly compare object type or regexp values, nor `SameValueZero` equality for dates
- `fast-deep-equal` does not support `NaN` or `SameValueZero` equality for dates
- `react-fast-compare` does not support `NaN` or `SameValueZero` equality for dates, and does not compare `function` equality
- `underscore.isEqual` does not support `SameValueZero` equality for primitives or dates
- `deep-equal` does not support `NaN` and does not strictly compare object type, or date / regexp values, nor uses `SameValueZero` equality for dates
- `deep-eql` does not support `SameValueZero` equality for zero equality (positive and negative zero are not equal)
- `assert.deepStrictEqual` does not support `NaN` or `SameValueZero` equality for dates

All of these have the potential of inflating the respective library's numbers in comparison to `fast-equals`, but it was the closest apples-to-apples comparison I could create of a reasonable sample size. `Map`s, `Promise`s, and `Set`s were excluded from the benchmark entirely because no library other than `lodash` supported their comparison. The same logic applies to `react` elements (which can be circular objects), but simple elements are non-circular objects so I kept the `react` comparison very basic to allow it to be included.

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

- benchmark => run benchmark tests against other equality libraries
- build => build `main`, `module`, and `browser` distributables with `rollup`
- clean => run `clean:dist`, `clean:es`, `clean:mjs`, and `clean:lib` scripts
- clean:dist => run `rimraf` on the `dist` folder
- clean:es => run `rimraf` on the `es` folder
- clean:lib => run `rimraf` on the `lib` folder
- clean:mjs => run `rimraf` on the `mjs` folder
- copy:mjs => copy all files from `es` folder to `mjs` folder (for node ESM consumption)
- dev => start webpack playground App
- dist => run `build`
- lint => run ESLint on all files in `src` folder (also runs on `dev` script)
- lint:fix => run `lint` script, but with auto-fixer
- prepublish:compile => run `lint`, `test:coverage`, `transpile:lib`, `transpile:es`, and `dist` scripts
- start => run `dev`
- test => run AVA with NODE_ENV=test on all files in `test` folder
- test:coverage => run same script as `test` with code coverage calculation via `nyc`
- test:watch => run same script as `test` but keep persistent watcher
- transpile:es => run Babel on all files, in `src` folder (transpiled to `es` folder without transpilation of ES2015 export syntax)
- transpile:lib => run Babel on all files in `src` folder (transpiled to `lib` folder)
