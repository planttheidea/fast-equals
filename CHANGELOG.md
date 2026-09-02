# fast-equals CHANGELOG

## Unreleased

### Enhancements

- `Map` and `Set` comparisons resolve entries by key / value lookup before falling back to the exhaustive scan. Entry
  order is not significant, so matching previously required scanning all of `b` for every entry of `a`; the common cases
  (primitive keys, and object keys held by shared reference) now resolve in constant time instead, leaving only what
  cannot be resolved that way to the scan. Measured against the previous implementation: `Set` of 200 strings is ~27x
  faster, `Map` of 200 string keys ~6x, and the worst case (every key a distinct object, so no lookup ever hits) is
  still ~1.1-1.5x faster because the remaining scan is smaller.

  This is not applied when a custom `createInternalComparator` is supplied. The comparisons the lookup skips are ones
  the default comparator provably resolves the same way, but a custom comparator receives the iteration index of the key
  within `b` and is not guaranteed to be transitive, so it keeps the exhaustive scan and its exact previous behavior.

- Integer `TypedArray`, `ArrayBuffer` and `DataView` comparisons compare the underlying bytes eight at a time for
  buffers of at least 128 bytes. Integer views hold no padding and no values with multiple representations, so this is
  equivalent to comparing elements. A 64KB `Uint8Array` is ~9x faster, 4KB ~6x, and buffers below the threshold are
  unaffected. Float views are excluded, since a bitwise comparison does not match the `NaN` semantics they require.

### Bugfixes

- `URL` comparisons now include the query string. `areUrlsEqual` compared each component individually but omitted
  `search`, so `https://foo.com/?a=1` and `https://foo.com/?a=2` were considered equal. It now compares `href`, which is
  the normalized serialization of every component, and is also faster than the previous seven comparisons.
- `Error` comparisons now include own enumerable properties. `Error` subclasses commonly carry data (`status`, `code`,
  ...), and previously only `name` / `message` / `cause` / `stack` were compared, so two errors differing only in those
  properties were considered equal.
- `Error.cause` is now compared by value rather than by reference, consistent with how every other nested value is
  compared. Errors are now also tracked for circular references, so an error that references itself through `cause` or
  an own property is safe under `circularDeepEqual` / `strictCircularDeepEqual`.
- Boxed `BigInt` values (`Object(1n)`) are now compared as primitive wrappers rather than by identity, matching how
  boxed `Number`, `String` and `Boolean` values are handled.
- Boxed `Symbol` values (`Object(Symbol())`) are now compared as primitive wrappers, which was the one remaining
  primitive wrapper type with no handling.
- `TypedArray` comparisons now treat `NaN` as equal to itself, matching the SameValueZero semantics documented for every
  other numeric comparison. Only float-backed views take the additional check, so integer views and `ArrayBuffer` /
  `DataView` are unaffected.

## 6.0.2

- [#197](https://github.com/planttheidea/fast-equals/pull/197) - Remove transitive dependencies with security
  vulnerabilities

## 6.0.1

- [#195](https://github.com/planttheidea/fast-equals/pull/195) - Use `.length` instead of `byteLength` for TypedArrays,
  which avoids V8 slow path on non-8-bit arrays
- [#195](https://github.com/planttheidea/fast-equals/pull/195) - Use `Uint8Array` instead of `Array` for
  `matchedIndices` storage for denser uninitialized loads
- [#195](https://github.com/planttheidea/fast-equals/pull/195) - Avoid unnecessary `concat` when no symbols exist on
  strict comparisons

## 6.0.0

### Breaking changes

- [#164](https://github.com/planttheidea/fast-equals/pull/164) - Drop UMD support and distribution of source maps (see
  [#161](https://github.com/planttheidea/fast-equals/pull/164) for reasoning)
- [#166](https://github.com/planttheidea/fast-equals/pull/166) - Remove `unsupportedTagComparators` object in favor of
  `getUnsupportedCustomComparator` method
- Add `sameValueEqual` method (`Object.is` with ponyfill for legacy environments) and make it the default number
  comparison (formerly used `sameValueZeroEqual`)
- [#170](https://github.com/planttheidea/fast-equals/pull/170) - Add `strictEqual` method for convenience and
  completeness

### Enhancements

- `BigInt` support added (uses same handlers as normal numbers)
- Faster!
- More flexibility for methods not included by default via `getUnsupportedCustomComparator`

## 5.4.0

- [#163](https://github.com/planttheidea/fast-equals/pull/163) - Fix handling of `TypedArray`-based checks, and add
  `areArrayBuffersEqual` and `areDataViewsEqual` to checks

## 5.3.4

- Update build infrastructure to ensure legacy types align with types built from source code

## 5.3.3

- [#147](https://github.com/planttheidea/fast-equals/pull/147) - Fix type resolution when using `Node16` as
  `moduleResolution` in TypeScript (fixes [#145](https://github.com/planttheidea/fast-equals/issues/145))

## 5.3.2

- [#154](https://github.com/planttheidea/fast-equals/pull/154) - Use include with `"files"` instead of exclude with
  `.npmignore` (Thanks [@43081j](https://github.com/43081j))
- [#155](https://github.com/planttheidea/fast-equals/pull/155) - Upgrade build dependencies to resolve security
  vulnerabilities

## 5.3.1

- [#153](https://github.com/planttheidea/fast-equals/pull/153) - Avoid publishing `.yarn` folder

## 5.3.0

- [#150](https://github.com/planttheidea/fast-equals/pull/150/files) - Add support for `unknownTagComparators` in custom
  configuration (thanks to @mrcljx for the idea)

## 5.2.2

- [#139](https://github.com/planttheidea/fast-equals/pull/139/files) - Add file extensions to type definition files to
  allow it to work in projects with `NodeNext` module resolution

## 5.2.1

### Bugfixes

- [#138](https://github.com/planttheidea/fast-equals/pull/138) - Actually fix reference to `src` code in `index.d.ts` by
  flattening types in file

## 5.2.0

### Enhancements

- Support Preact objects in equality comparison

### Bugfixes

- [#137](https://github.com/planttheidea/fast-equals/pull/137) - Fix circular React references in object comparisons

## 5.1.3

### Enhancements

- [#136](https://github.com/planttheidea/fast-equals/pull/136) - More than double speed of iterables (`Map` / `Set`)
  equality comparisons

### Maintenance

- [#135](https://github.com/planttheidea/fast-equals/pull/135) - Include `dequal` and `dequal/lite` in benchmark
  comparisons

## 5.1.2

### Maintenance

Re-release of `5.1.0` with correct pre-release setup.

## 5.1.1

**DO NOT USE**

This was an accidental pre-release when cleaning up release setup.

## 5.1.0

### Enhancements

- [#127](https://github.com/planttheidea/fast-equals/pull/127) - Add support for custom `Function` instance comparisons
  (resolves [#118](https://github.com/planttheidea/fast-equals/issues/118))
- [#128](https://github.com/planttheidea/fast-equals/pull/128) - Add support for `URL` instance comparisons (resolves
  [#121](https://github.com/planttheidea/fast-equals/issues/121))
- [#129](https://github.com/planttheidea/fast-equals/pull/129) - Add support for `Error` instance comparisons (resolves
  [#123](https://github.com/planttheidea/fast-equals/issues/123))
- [#130](https://github.com/planttheidea/fast-equals/pull/130) - Add support for custom `Number` instance comparisons
  (resolves [#112](https://github.com/planttheidea/fast-equals/issues/112))

### Bugfixes

- [#132](https://github.com/planttheidea/fast-equals/pull/126) - Fix `assert.deepEqual` check in benchmark (resolves
  [#125](https://github.com/planttheidea/fast-equals/issues/125))
- [#126](https://github.com/planttheidea/fast-equals/pull/132) - Export explicit types via `export type` (attempts to
  resolve [#114](https://github.com/planttheidea/fast-equals/issues/114))

## 5.0.1

### Bugfixes

- Fix reference to `metaOverride` in typings and documentation (holdover from temporary API in v5 beta)

## 5.0.0

### Breaking changes

#### `constructor` equality now required

To align with other implementations common in the community, but also to be more functionally correct, the two objects
being compared now must have equal `constructor`s.

#### `Map` / `Set` comparisons no longer support IE11

In previous verisons, `.forEach()` was used to ensure that support for `Symbol` was not required, as IE11 did not have
`Symbol` and therefore both `Map` and `Set` did not have iterator-based methods such as `.values()` or `.entries()`.
Since IE11 is no longer a supported browser, and support for those methods is present in all browsers and Node for quite
a while, the comparison has moved to use these methods. This results in a ~20% performance increase.

#### `createCustomEqual` contract has changed

To better facilitate strict comparisons, but also to allow for `meta` use separate from caching, the contract for
`createCustomEqual` has changed. See the [README documentation](./README.md#createcustomequal) for more details, but
froma high-level:

- `meta` is no longer passed through to equality comparators, but rather a general `state` object which contains `meta`
- `cache` now also lives on the `state` object, which allows for use of the `meta` property separate from but in
  parallel with the circular cache
- `equals` is now on `state`, which prevents the need to pass through the separate `isEqual` method for the equality
  comparator

#### `createCustomCircularEqual` has been removed

You can create a custom circular equality comparator through `createCustomEqual` now by providing `circular: true` to
the options.

#### Custom `meta` values are no longer passed at callsite

To use `meta` properties for comparisons, they must be returned in a `createState` method.

#### Deep links have changed

If you were deep-linking into a specific asset type (ESM / CJS / UMD), they have changed location.

**NOTE**: You may no longer need to deep-link, as [the build resolution has improved](#better-build-system-resolution).

### Enhancements

#### New "strict" comparators available

The following new comparators are available:

- `strictDeepEqual`
- `strictShallowEqual`
- `strictCircularDeepEqual`
- `strictCircularShallowEqual`

This will perform the same comparisons as their non-strict counterparts, but will verify additional properties
(non-enumerable properties on objects, keyed objects on `Array` / `Map` / `Set`) and that the descriptors for the
properties align.

#### `TypedArray` support

Support for comparing all typed array values is now supported, and you can provide a custom comparator via the new
`areTypedArraysEqual` option in the `createCustomEqual` configuration.

#### Better build system resolution

The library now leverages the `exports` property in the `package.json` to provide builds specific to your method of
consumption (ESM / CommonJS / UMD). There is still a minified UMD version available if you want to use it instead.

#### `arePrimitiveWrappersEqual` option added to `createCustomEqual` configuration

If you want a custom comparator for primitive wrappers (`new Boolean()` / `new Number()` / `new String()`) it is now
available.

## 4.0.3

- Remove unnecessary second strict equality check for objects in edge-case scenarios

## 4.0.2

- [#85](https://github.com/planttheidea/fast-equals/issues/85) - `createCustomCircularEqual` typing is incorrect

## 4.0.1

- [#81](https://github.com/planttheidea/fast-equals/issues/81) - Fix typing issues related to importing in `index.d.ts`
  file

## 4.0.0

### Breaking Changes

#### Certain ES2015 features are now required

In previous versions, there were automatic fallbacks for certain ES2015 features if they did not exist:

- [`RegExp.prototype.flags`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/flags)
- [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)

Due to the omnipresence of support in both browser and NodeJS, these have been deprecated. There is still an option if
you require support for these legacy environments, however; see [`createCustomEqual`](./README.md#createcustomequal) and
[`createCustomCircularEqual`](./README.md#createcustomcircularequal) for more details.

#### `createCustomEqual` contract has changed

To allow more flexibility and customizability for a variety of edge cases, `createCustomEqual` now allows override of
specific type value comparisons in addition to the general comparator it did prior. See
[the documentation](./README.md#createcustomequal) for more details.

### Enhancements

#### `createCustomCircularEqual` added

Like `createCustomEqual`, it will create a custom equality comparator, with the exception that it will handle circular
references. See [the documentation](./README.md#createcustomcircularequal) for more details.

#### Cross-realm comparisons are now supported

Prior to `4.x.x.`, `instanceof` was used internally for checking of object classes, which only worked when comparing
objects from the same [Realm](https://262.ecma-international.org/6.0/#sec-code-realms). This has changed to instead use
an object's
[StringTag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag), which
is not realm-specific.

#### TypeScript typings improved

For better typing in edge-case scenarios like custom comparators with `meta` values, typings have been refactored for
accuracy and better narrow flow-through.

## 3.0.3

- Fix [#77](https://github.com/planttheidea/fast-equals/issues/73) - better circular object validation

## 3.0.2

- Fix [#73](https://github.com/planttheidea/fast-equals/issues/73) - support comparison of primitive wrappers
- [#76](https://github.com/planttheidea/fast-equals/pull/76) - improve speed and accuracy of `RegExp` comparison in
  modern environments

## 3.0.1

- Fix [#71](https://github.com/planttheidea/fast-equals/pull/71) - use generic types for better type flow-through

## 3.0.0

### Breaking changes

When creating a custom equality comparator via `createCustomEqual`, the equality method has an expanded contract:

```ts
// Before
type EqualityComparator = (objectA: any, objectB: any, meta: any) => boolean;

// After
type InternalEqualityComparator = (
  objectA: any,
  objectB: any,
  indexOrKeyA: any,
  indexOrKeyB: any,
  parentA: any,
  parentB: any,
  meta: any,
) => boolean;
```

If you have a custom equality comparator, you can ignore the differences by just passing additional `undefined`
parameters, or you can use the parameters to further improve / clarify the logic.

- Add [#57](https://github.com/planttheidea/fast-equals/pull/57) - support additional metadata for custom equality
  comparators

## 2.0.4

- Fix [#58](https://github.com/planttheidea/fast-equals/issues/58) - duplicate entries in `Map` / `Set` can create false
  equality success
- [#60](https://github.com/planttheidea/fast-equals/issues/60) - Add documentation for key equality of `Map` being a
  part of `deepEqual`

## 2.0.3

- Fix [#50](https://github.com/planttheidea/fast-equals/pull/50) - copy-pasta in cacheable check

## 2.0.2

- Optimize iterables comparisons to not double-iterate
- Optimize loop-based comparisons for speed
- Improve cache handling in circular handlers
- Improve stability of memory by reducing variable instantiation

## 2.0.1

- Fix [#41](https://github.com/planttheidea/fast-equals/pull/41) - prevent `.rpt2_cache` directory from being published
  for better CI environment support (thanks [@herberttn](https://github.com/herberttn))

## 2.0.0

### Breaking changes

- There are longer `fast-equals/es`, `fast-equals/lib`, `fast-equals/mjs` locations
  - Instead, there are 3 builds in `dist` for different consumption types:
    - `fast-equals.js` (UMD / `browser`)
    - `fast-equals.esm.js` (ESM / `module`)
    - `fast-equals.cjs.js` (CommonJS / `main`)
- There is no default export anymore, only the previously-existing named exports
  - To get all into a namespace, use `import * as fe from 'fast-equals`

### Updates

- Rewritten completely in TypeScript
- Improve speed of `Map` / `Set` comparisons
- Improve speed of React element comparisons

### Fixes

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

- Add [`circularDeepEqual`](README.md#circulardeepequal) and [`circularShallowEqual`](README.md#circularshallowequal)
  methods
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

```

```
