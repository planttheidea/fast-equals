import { createComparator, createComparatorConfig } from './comparator';
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
    circular,
    comparator,
    createInternalComparator: createCustomInternalComparator,
    createState,
    strict: baseStrict = false,
  } = options;

  const config = createComparatorConfig<Meta>(options);
  const isEqualCustom = createComparator(config);
  const isEqualCustomComparator =
    comparator ||
    (createCustomInternalComparator
      ? createCustomInternalComparator(isEqualCustom)
      : createInternalComparator(isEqualCustom));

  if (createState) {
    return function isEqual<A, B>(
      a: A,
      b: B,
      metaOverride?: Meta | undefined,
    ): boolean {
      const {
        cache = circular ? new WeakMap() : undefined,
        equals = isEqualCustomComparator,
        meta,
        strict = baseStrict,
      } = createState!(isEqualCustom);

      return isEqualCustom(a, b, {
        cache,
        equals,
        meta: metaOverride !== undefined ? metaOverride : meta,
        strict,
      } as CircularState<Meta>);
    };
  }

  if (circular) {
    return function equals<A, B>(a: A, b: B): boolean {
      return isEqualCustom(a, b, {
        cache: new WeakMap(),
        equals: isEqualCustomComparator,
        meta: undefined as Meta,
        strict: baseStrict,
      } as CircularState<Meta>);
    };
  }

  const state = Object.freeze({
    cache: undefined,
    equals: isEqualCustomComparator,
    meta: undefined,
    strict: baseStrict,
  });

  return function equals<A, B>(a: A, b: B): boolean {
    return isEqualCustom(a, b, state as DefaultState<Meta>);
  };
}
