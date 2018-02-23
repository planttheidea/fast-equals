# fast-equals CHANGELOG

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
