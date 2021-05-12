# fast-equals CHANGELOG

## 2.0.3

- Fix [#50](https://github.com/planttheidea/fast-equals/pull/50) - copy-pasta in cacheable check

## 2.0.2

- Optimize iterables comparisons to not double-iterate
- Optimize loop-based comparisons for speed
- Improve cache handling in circular handlers
- Improve stability of memory by reducing variable instantiation

## 2.0.1

- Fix [#41](https://github.com/planttheidea/fast-equals/pull/41) - prevent `.rpt2_cache` directory from being published for better CI environment support (thanks [@herberttn](https://github.com/herberttn))

## 2.0.0

#### Breaking changes

- There are longer `fast-equals/es`, `fast-equals/lib`, `fast-equals/mjs` locations
  - Instead, there are 3 builds in `dist` for different consumption types:
    - `fast-equals.js` (UMD / `browser`)
    - `fast-equals.esm.js` (ESM / `module`)
    - `fast-equals.cjs.js` (CommonJS / `main`)
- There is no default export anymore, only the previously-existing named exports
  - To get all into a namespace, use `import * as fe from 'fast-equals`

#### Updates

- Rewritten completely in TypeScript
- Improve speed of `Map` / `Set` comparisons
- Improve speed of React element comparisons

#### Fixes

- Consider pure objects (`Object.create(null)`) to be plain objects
- Fix typings for `createCustomEqual`

## 1.6.3

- Check the size of the iterable before converting to arrays

## 1.6.2

- Fix [#23](https://github.com/planttheidea/fast-equals/issues/23) - false positives for map
- Replace `uglify` with `terser`
- Use `rollup` to build all the distributables (`main`, `module`, and `browser`)
  - Maintain `lib` and `es` transpilations in case consumers were deep-linking

## 1.6.1

- Upgrade to `babel@7`
- Add `"sideEffects": false` to `package.json` for better tree-shaking in `webpack`

## 1.6.0

- Add ESM support for NodeJS with separate [`.mjs` extension](https://nodejs.org/api/esm.html) exports

## 1.5.3

- Fix `Map` / `Set` comparison to not require order to match to be equal

## 1.5.2

- Improve speed of object comparison through custom `hasKey` method

## 1.5.1

- Fix lack of support for `unicode` and `sticky` RegExp flag checks

## 1.5.0

- Add [`circularDeepEqual`](README.md#circulardeepequal) and [`circularShallowEqual`](README.md#circularshallowequal) methods
- Add `meta` third parameter to `comparator` calls, for use with `createCustomEqual` method

## 1.4.1

- Fix issue where `lastIndex` was not being tested on `RegExp` objects

## 1.4.0

- Add support for comparing promise-like objects (strict equality only)

## 1.3.1

- Make `react` comparison more accurate, and a touch faster

## 1.3.0

- Add support for deep-equal comparisons between `react` elements
- Add comparison with `react-fast-compare`
- Use `rollup` for `dist` file builds

## 1.2.1

- Fix errors from TypeScript typings in strict mode (thanks [@HitoriSensei](https://github.com/HitoriSensei))

## 1.2.0

- Surface `isSameValueZero` as [`sameValueZeroEqual`](#samevaluezeroequal) option

## 1.1.0

- Add TypeScript typings (thanks [@josh-sachs](https://github.com/josh-sachs))

## 1.0.6

- Support invalid date equality via `isSameValueZero`

## 1.0.5

- Replace `isStrictlyEqual` with `isSameValueZero` to ensure that `shallowEqual` accounts for `NaN` equality

## 1.0.4

- Only check values when comparing `Set` objects (improves performance of `Set` check by ~12%)

## 1.0.3

- Make `Map` and `Set` comparisons more explicit

## 1.0.2

- Fix symmetrical comparison of iterables
- Reduce footprint

## 1.0.1

- Prevent babel transpilation of `typeof` into helper for faster runtime

## 1.0.0

- Initial release
