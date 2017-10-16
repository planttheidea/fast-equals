# fast-equals

<img src="https://img.shields.io/badge/build-passing-brightgreen.svg"/>
<img src="https://img.shields.io/badge/coverage-100%25-brightgreen.svg"/>
<img src="https://img.shields.io/badge/license-MIT-blue.svg"/>

Perform [blazing fast](#benchmarks) equality comparisons (either deep or shallow) on two objects passed. It has no dependencies, and is ~1.2Kb when minified and gzipped.

Unlike most equality validation libraries, the following types are handled out-of-the-box:
* `NaN`
* `Date` objects
* `RegExp` objects
* `Map` / `Set` iterables

You can also create a custom nested comparator, for specific scenarios ([see below](#createcustomequal)).

## Table of contents
* [Usage](#usage)
* [Available methods](#available-methods)
  * [deepEqual](#deepequal)
  * [shallowEqual](#shallowequal)
  * [createCustomEqual](#createcustomequal)
* [Benchmarks](#benchmarks)
* [Development](#development)

## Usage

You can either import the full object:

```javascript
import fe from 'fast-equals';

console.log(fe.deep({foo: 'bar'}, {foo: 'bar'})); // true
```

Or the individual imports desired:

```javascript
import {deepEqual} from 'fast-equals';

console.log(deepEqual({foo: 'bar'}, {foo: 'bar'})); // true
```

## Available methods

#### deepEqual

*Aliased on the default export as `fe.deep`*

Performs a deep equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

```javascript
import {deepEqual} from 'fast-equals';

const objectA = {foo: {bar: 'baz'}};
const objectB = {foo: {bar: 'baz'}};

console.log(objectA === objectB); // false
console.log(deepEqual(objectA, objectB)); // true
```

#### shallowEqual

*Aliased on the default export as `fe.shallow`*

Performs a shallow equality comparison on the two objects passed and returns a boolean representing the value equivalency of the objects.

```javascript
import {shallowEqual} from 'fast-equals';

const nestedObject = {bar: 'baz'};

const objectA = {foo: nestedObject};
const objectB = {foo: nestedObject};
const objectC = {foo: {bar: 'baz'}};

console.log(objectA === objectB); // false
console.log(shallowEqual(objectA, objectB)); // true
console.log(shallowEqual(objectA, objectC)); // false
```

#### createCustomEqual

*Aliased on the default export as `fe.createCustom`*

Creates a custom equality comparator that will be used on nested values in the object. Unlike `deepEqual` and `shallowEqual`, this is a partial-application function that will receive the internal comparator and should return a function that compares two objects.

A common use case for this is to handle circular objects (which `fast-equals` does not handle by default). Example:

```javascript
import {createCustomEqual} from 'fast-equals';
import decircularize from 'decircularize';

const isDeepEqualCircular = createCustomEqual((comparator) => {
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
* A mixed object with a combination of all the above types

|                        | Operations / second | Relative margin of error |
|------------------------|---------------------|--------------------------|
| **fast-equals**        | **201,249**         | **0.60%**                |
| nano-equal             | 119,409             | 1.38%                    |
| fast-deep-equal        | 92,048              | 0.44%                    |
| shallow-equal-fuzzy    | 80,478              | 0.58%                    |
| underscore.isEqual     | 49,145              | 0.49%                    |
| deep-equal             | 31,906              | 0.73%                    |
| lodash.isEqual         | 24,293              | 0.50%                    |
| deep-eql               | 14,600              | 0.74%                    |
| assert.deepStrictEqual | 454                 | 1.32%                    |

Caveats that impact the benchmark:
* `fast-deep-equal` does not support `NaN`
* `nano-equal` does not strictly compare object property structure, array length, or object type
* `shallow-equal-fuzzy` does not strictly compare object type or regexp values
* `deep-equal` does not support `NaN` and does not strictly compare object type, or date / regexp values
* `assert.deepStrictEqual` does not support `NaN`

All of these have the potential of inflating the respective library's numbers in comparison to `fast-equals`, but it was the closest apples-to-apples comparison I could create of a reasonable sample size. `Map`s and `Set`s were excluded from the benchmark entirely because no library other than `lodash` supported their comparison.

### Development

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
