import {
  createCircularComparatorConfig,
  createComparator,
  createComparatorConfigBase,
} from './comparator';
import type {
  CircularState,
  CustomEqualCreatorOptions,
  DefaultState,
} from './internalTypes';
import { createInternalComparator, sameValueZeroEqual } from './utils';

export { sameValueZeroEqual };
export * from './internalTypes';

/**
 * Whether the items passed are deeply-equal in value.
 */
export const deepEqual = createCustomEqual();

/**
 * Whether the items passed are deeply-equal in value based on strict comparison.
 */
export const strictDeepEqual = createCustomEqual({ strict: true });

/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export const circularDeepEqual = createCustomEqual({ circular: true });

/**
 * Whether the items passed are deeply-equal in value, including circular references,
 * based on strict comparison.
 */
export const strictCircularDeepEqual = createCustomEqual({
  circular: true,
  strict: true,
});

/**
 * Whether the items passed are shallowly-equal in value.
 */
export const shallowEqual = createCustomEqual({
  comparator: sameValueZeroEqual,
});

/**
 * Whether the items passed are shallowly-equal in value based on strict comparison
 */
export const strictShallowEqual = createCustomEqual({
  comparator: sameValueZeroEqual,
  strict: true,
});

/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export const circularShallowEqual = createCustomEqual({
  comparator: sameValueZeroEqual,
  circular: true,
});

/**
 * Whether the items passed are shallowly-equal in value, including circular references,
 * based on strict comparison.
 */
export const strictCircularShallowEqual = createCustomEqual({
  comparator: sameValueZeroEqual,
  circular: true,
  strict: true,
});

/**
 * Create a custom equality comparison method.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `RegExp.prototype.flags` out of the box.
 */
export function createCustomEqual<Meta>(
  options: CustomEqualCreatorOptions<Meta> = {},
) {
  const {
    comparator,
    createInternalComparator: createCustomInternalComparator,
    createCustomConfig,
    createState,
  } = options;

  const baseConfig = createComparatorConfigBase<Meta>(options.strict);
  const combinedConfig = createCustomConfig
    ? Object.assign({}, baseConfig, createCustomConfig(baseConfig))
    : baseConfig;
  const config = options.circular
    ? createCircularComparatorConfig(combinedConfig)
    : combinedConfig;
  const isEqualCustom = createComparator(config);
  const isEqualCustomComparator =
    comparator ||
    (createCustomInternalComparator
      ? createCustomInternalComparator(isEqualCustom)
      : createInternalComparator(isEqualCustom));
  const strict = !!options.strict;

  if (createState) {
    return function isEqual<A, B>(a: A, b: B, metaOverride?: Meta): boolean {
      const customState = createState(isEqualCustom);

      return isEqualCustom(a, b, {
        cache: customState.cache || new WeakMap(),
        equals: customState.equals || isEqualCustomComparator,
        // @ts-expect-error - inferred `Meta` may be undefined, which is okay
        meta: metaOverride !== undefined ? metaOverride : customState.meta,
        strict: customState.strict !== undefined ? customState.strict : strict,
      });
    };
  }

  if (options.circular) {
    return function equals<A, B>(a: A, b: B): boolean {
      return isEqualCustom(a, b, {
        cache: new WeakMap(),
        equals: isEqualCustomComparator,
        meta: undefined as Meta,
        strict,
      } as CircularState<Meta>);
    };
  }

  const state = Object.freeze({
    cache: undefined,
    equals: isEqualCustomComparator,
    meta: undefined,
    strict,
  });

  return function equals<A, B>(a: A, b: B): boolean {
    return isEqualCustom(a, b, state as DefaultState<Meta>);
  };
}
