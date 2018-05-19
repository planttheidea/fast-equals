# fast-equals CHANGELOG

## 1.5.2

* Improve speed of object comparison through custom `hasKey` method

## 1.5.1

* Fix lack of support for `unicode` and `sticky` RegExp flag checks

## 1.5.0

* Add [`circularDeepEqual`](README.md#circulardeepequal) and [`circularShallowEqual`](README.md#circularshallowequal) methods
* Add `meta` third parameter to `comparator` calls, for use with `createCustomEqual` method

## 1.4.1

* Fix issue where `lastIndex` was not being tested on `RegExp` objects

## 1.4.0

* Add support for comparing promise-like objects (strict equality only)

## 1.3.1

* Make `react` comparison more accurate, and a touch faster

## 1.3.0

* Add support for deep-equal comparisons between `react` elements
* Add comparison with `react-fast-compare`
* Use `rollup` for `dist` file builds

## 1.2.1

* Fix errors from TypeScript typings in strict mode (thanks [@HitoriSensei](https://github.com/HitoriSensei))

## 1.2.0

* Surface `isSameValueZero` as [`sameValueZeroEqual`](#samevaluezeroequal) option

## 1.1.0

* Add TypeScript typings (thanks [@josh-sachs](https://github.com/josh-sachs))

## 1.0.6

* Support invalid date equality via `isSameValueZero`

## 1.0.5

* Replace `isStrictlyEqual` with `isSameValueZero` to ensure that `shallowEqual` accounts for `NaN` equality

## 1.0.4

* Only check values when comparing `Set` objects (improves performance of `Set` check by ~12%)

## 1.0.3

* Make `Map` and `Set` comparisons more explicit

## 1.0.2

* Fix symmetrical comparison of iterables
* Reduce footprint

## 1.0.1

* Prevent babel transpilation of `typeof` into helper for faster runtime

## 1.0.0

* Initial release
