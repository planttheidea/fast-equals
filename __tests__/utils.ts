import { describe, expect, it } from 'vitest';
import { sameValueZeroEqual } from '../src/utils.ts';

import {
  alternativeValues,
  mainValues,
  primitiveValues,
} from './__helpers__/dataTypes.ts';

describe('isSameValueZero', () => {
  Object.keys(primitiveValues).forEach((key) => {
    it(`should have ${key} be equal by SameValueZero`, () => {
      expect(
        sameValueZeroEqual(
          primitiveValues[key as keyof typeof primitiveValues],
          mainValues[key as keyof typeof primitiveValues],
        ),
      ).toBe(true);
    });
  });

  Object.keys(mainValues).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(primitiveValues, key)) {
      it(`should have ${key} be equal by SameValueZero`, () => {
        expect(
          sameValueZeroEqual(
            mainValues[key as keyof typeof mainValues],
            mainValues[key as keyof typeof mainValues],
          ),
        ).toBe(true);
      });
    }
  });

  Object.keys(alternativeValues).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(mainValues, key)) {
      it(`should have ${key} not be equal by SameValueZero`, () => {
        expect(
          sameValueZeroEqual(
            alternativeValues[key as keyof typeof alternativeValues],
            mainValues[key as keyof typeof alternativeValues],
          ),
        ).toBe(false);
      });
    }
  });
});
