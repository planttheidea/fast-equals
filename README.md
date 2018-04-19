# fast-equals

<img src="https://img.shields.io/badge/build-passing-brightgreen.svg"/>
<img src="https://img.shields.io/badge/coverage-100%25-brightgreen.svg"/>
<img src="https://img.shields.io/badge/license-MIT-blue.svg"/>

Perform [blazing fast](#benchmarks) equality comparisons (either deep or shallow) on two objects passed. It has no dependencies, and is ~985 bytes when minified and gzipped.

Unlike most equality validation libraries, the following types are handled out-of-the-box:

* `NaN`
* `Date` objects
* `RegExp` objects
* `Map` / `Set` iterables
* `react` elements

You can also create a custom nested comparator, for specific scenarios ([see below](#createcustomequal)).

## Table of contents

* [Usage](#usage)
* [Available methods](#available-methods)
  * [deepEqual](#deepequal)
  * [shallowEqual](#shallowequal)
  * [sameValueZeroEqual](#samevaluezeroequal)
  * [createCustomEqual](#createcustomequal)
* [Benchmarks](#benchmarks)
* [Development](#development)

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

#### createCustomEqual

_Aliased on the default export as `fe.createCustom`_

Creates a custom equality comparator that will be used on nested values in the object. Unlike `deepEqual` and `shallowEqual`, this is a partial-application function that will receive the internal comparator and should return a function that compares two objects.

A common use case for this is to handle circular objects (which `fast-equals` does not handle by default). Example:

```javascript
import { createCustomEqual } from "fast-equals";
import decircularize from "decircularize";

const isDeepEqualCircular = createCustomEqual(comparator => {
  return (objectA, objectB) => {
    return comparator(decircularize(objectA), decircularize(objectB));
  };
});

const objectA = {};
const objectB = {};

objectA.a = objectA;
objectA.b = objectB;

objectB.a = objectA;
objectB.b = objectB;

console.log(isDeepEqualCircular(objectA, objectB)); // true
```

## Benchmarks

All benchmarks are based on averages of running comparisons based on the following data types:

* Primitives (`String`, `Number`, `null`, `undefined`)
* `Function`s
* `Object`s
* `Array`s
* `Date`s
* `RegExp`s
* `react` elements
* A mixed object with a combination of all the above types

|                        | Operations / second | Relative margin of error |
| ---------------------- | ------------------- | ------------------------ |
| **fast-equals**        | **158,904**         | **0.50%**                |
| nano-equal             | 107,118             | 1.33%                    |
| fast-deep-equal        | 101,115             | 0.59%                    |
| shallow-equal-fuzzy    | 100,383             | 0.60%                    |
| react-fast-compare     | 99,924              | 0.85%                    |
| underscore.isEqual     | 63,524              | 0.68%                    |
| deep-equal             | 30,703              | 0.50%                    |
| lodash.isEqual         | 25,678              | 0.65%                    |
| deep-eql               | 16,646              | 0.54%                    |
| assert.deepStrictEqual | 1,583               | 1.04%                    |

Caveats that impact the benchmark (and accuracy of comparison):

* `nano-equal` does not strictly compare object property structure, array length, or object type, nor `SameValueZero` equality for dates
* `shallow-equal-fuzzy` does not strictly compare object type or regexp values, nor `SameValueZero` equality for dates
* `fast-deep-equal` does not support `NaN` or `SameValueZero` equality for dates
* `react-fast-compare` does not support `NaN` or `SameValueZero` equality for dates, and does not compare `function` equality
* `underscore.isEqual` does not support `SameValueZero` equality for primitives or dates
* `deep-equal` does not support `NaN` and does not strictly compare object type, or date / regexp values, nor uses `SameValueZero` equality for dates
* `deep-eql` does not support `SameValueZero` equality for zero equality (positive and negative zero are not equal)
* `assert.deepStrictEqual` does not support `NaN` or `SameValueZero` equality for dates

All of these have the potential of inflating the respective library's numbers in comparison to `fast-equals`, but it was the closest apples-to-apples comparison I could create of a reasonable sample size. `Map`s and `Set`s were excluded from the benchmark entirely because no library other than `lodash` supported their comparison. The same logic applies to `react` elements (which can be circular objects), but simple elements are non-circular objects so I kept the `react` comparison very basic to allow it to be included.

## Development

Standard practice, clone the repo and `npm i` to get the dependencies. The following npm scripts are available:

* benchmark => run benchmark tests against other equality libraries
* build => build unminified dist version with source map and NODE_ENV=development via webpack
* build:minified => build minified dist version with NODE_ENV=production via webpack
* clean => run `clean:dist`, `clean:es`, and `clean:lib` scripts
* clean:dist => run `rimraf` on the `dist` folder
* clean:es => run `rimraf` on the `es` folder
* clean:lib => run `rimraf` on the `lib` folder
* dev => start webpack playground App
* dist => run `build` and `build:minified` scripts
* lint => run ESLint on all files in `src` folder (also runs on `dev` script)
* lint:fix => run `lint` script, but with auto-fixer
* prepublish =>
* prepublish:compile => run `lint`, `test:coverage`, `transpile:lib`, `transpile:es`, and `dist` scripts
* start => run `dev`
* test => run AVA with NODE_ENV=test on all files in `test` folder
* test:coverage => run same script as `test` with code coverage calculation via `nyc`
* test:watch => run same script as `test` but keep persistent watcher
* transpile:es => run Babel on all files in `src` folder (transpiled to `es` folder without transpilation of ES2015 export syntax)
* transpile:lib => run Babel on all files in `src` folder (transpiled to `lib` folder)
