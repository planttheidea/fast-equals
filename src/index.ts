import { createComparator } from './comparator';
import {
  areArraysEqual,
  areDatesEqual,
  areMapsEqual,
  areObjectsEqual,
  areObjectsEqualStrict,
  arePrimitiveWrappersEqual,
  areRegExpsEqual,
  areSetsEqual,
} from './equals';
import type {
  CircularState,
  ComparatorConfig,
  CreateCustomComparatorConfig,
  CreateState,
  DefaultState,
  InternalEqualityComparator,
} from './internalTypes';
import {
  combineComparators,
  createInternalComparator,
  createIsCircular,
  sameValueZeroEqual,
} from './utils';

export { sameValueZeroEqual };

interface DefaultEqualCreatorOptions<Meta> {
  comparator?: InternalEqualityComparator<Meta>;
  circular?: boolean;
  strict?: boolean;
}

function createComparatorConfig<Meta>({
  circular,
  strict,
}: DefaultEqualCreatorOptions<Meta>) {
  const config: ComparatorConfig<Meta> = {
    areArraysEqual,
    areDatesEqual,
    areMapsEqual,
    areObjectsEqual,
    arePrimitiveWrappersEqual,
    areRegExpsEqual,
    areSetsEqual,
  };

  if (strict) {
    config.areArraysEqual = areObjectsEqual;
    config.areMapsEqual = combineComparators(areMapsEqual, areObjectsEqual);
    config.areObjectsEqual = areObjectsEqualStrict;
    config.areSetsEqual = combineComparators(areSetsEqual, areObjectsEqual);
  }

  if (circular) {
    config.areArraysEqual = createIsCircular(config.areArraysEqual);
    config.areMapsEqual = createIsCircular(config.areMapsEqual);
    config.areObjectsEqual = createIsCircular(config.areObjectsEqual);
    config.areSetsEqual = createIsCircular(config.areSetsEqual);
  }

  return config;
}

function createDefaultEqualCreator(
  options: DefaultEqualCreatorOptions<undefined> = {},
) {
  const config = createComparatorConfig(options);
  const isEqual = createComparator(config);
  const isEqualComparator =
    options.comparator || createInternalComparator(isEqual);
  const strict = !!options.strict;

  if (options.circular) {
    return function equals<A, B>(a: A, b: B): boolean {
      return isEqual(a, b, {
        cache: new WeakMap(),
        equals: isEqualComparator,
        meta: undefined,
        strict,
      });
    };
  }

  const state = Object.freeze({
    cache: undefined,
    equals: isEqualComparator,
    meta: undefined,
    strict,
  });

  return function equals<A, B>(a: A, b: B): boolean {
    return isEqual(a, b, state);
  };
}

function createCustomEqualCreator(
  options: DefaultEqualCreatorOptions<any> = {},
) {
  return function createCustomEqual<Meta>(
    createCustomConfig: CreateCustomComparatorConfig<Meta>,
    createState?: CreateState<Meta>,
  ) {
    const config = createComparatorConfig(options);
    const customConfig = createCustomConfig(config);
    const isEqualCustom = createComparator({ ...config, ...customConfig });
    const isEqualCustomComparator = createInternalComparator(isEqualCustom);
    const strict = !!options.strict;

    if (createState) {
      return function isEqual<A, B>(a: A, b: B, metaOverride?: Meta): boolean {
        const customState = createState(isEqualCustom);

        return isEqualCustom(a, b, {
          cache: customState.cache || new WeakMap(),
          equals: customState.equals || isEqualCustomComparator,
          meta: metaOverride !== undefined ? metaOverride : customState.meta,
          strict:
            customState.strict !== undefined ? customState.strict : strict,
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
  };
}

/**
 * Whether the items passed are deeply-equal in value.
 */
export const deepEqual = createDefaultEqualCreator();

/**
 * Whether the items passed are deeply-equal in value, including circular references.
 */
export const circularDeepEqual = createDefaultEqualCreator({ circular: true });

/**
 * Whether the items passed are shallowly-equal in value.
 */
export const shallowEqual = createDefaultEqualCreator({
  comparator: sameValueZeroEqual,
});

/**
 * Whether the items passed are shallowly-equal in value, including circular references.
 */
export const circularShallowEqual = createDefaultEqualCreator({
  comparator: sameValueZeroEqual,
  circular: true,
});

/**
 * Create a custom equality comparison method.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `RegExp.prototype.flags` out of the box.
 */
export const createCustomEqual = createCustomEqualCreator();

/**
 * Create a custom equality comparison method that handles circular references. This is very
 * similar to `createCustomEqual`, with the only difference being that `meta` expects to be
 * populated with a `WeakMap`-like contract.
 *
 * This can be done to create very targeted comparisons in extreme hot-path scenarios
 * where the standard methods are not performant enough, but can also be used to provide
 * support for legacy environments that do not support expected features like
 * `WeakMap` out of the box.
 */
export const createCustomCircularEqual = createCustomEqualCreator({
  circular: true,
});
