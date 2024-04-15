import { describe, expect, it } from 'vitest';

import { splitQuantity } from '../../src/utils/splitQuantity';
import { CustomError } from '../../src/utils/customError';

describe('splitQuantity', () => {
  it.each([
    [10, 3, [3, 3, 4]],
    [10, 1, [10]],
    [4, 4, [1, 1, 1, 1]],
    [7, 2, [3, 4]],
  ])('splits %i units over %i parcels as %j', (quantity, parcels, expected) => {
    expect(splitQuantity(quantity, parcels)).toEqual(expected);
  });

  it('always adds up to the original quantity', () => {
    for (let quantity = 1; quantity <= 40; quantity++) {
      for (let parcels = 1; parcels <= quantity; parcels++) {
        const split = splitQuantity(quantity, parcels);
        expect(split).toHaveLength(parcels);
        expect(split.reduce((sum, part) => sum + part, 0)).toBe(quantity);
        expect(Math.min(...split)).toBeGreaterThan(0);
      }
    }
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects %s parcels', (parcels) => {
    expect(() => splitQuantity(5, parcels)).toThrow(CustomError);
  });

  it('rejects more parcels than units with a 422', () => {
    try {
      splitQuantity(2, 3);
      expect.unreachable();
    } catch (error) {
      expect((error as CustomError).statusCode).toBe(422);
    }
  });
});
