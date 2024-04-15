import { CustomError } from './customError';

/**
 * Splits an order item's quantity across `parcels` barcodes: every parcel
 * gets the same share and the last one also takes the remainder, so
 * 10 units over 3 barcodes becomes [3, 3, 4].
 */
export const splitQuantity = (quantity: number, parcels: number): number[] => {
  if (!Number.isInteger(parcels) || parcels < 1) {
    throw new CustomError('number_of_barcodes must be a whole number of at least 1.', 422);
  }
  // More barcodes than units used to create parcels holding zero items.
  if (parcels > quantity) {
    throw new CustomError(`Cannot split ${quantity} item(s) into ${parcels} parcels.`, 422);
  }

  const share = Math.floor(quantity / parcels);
  return Array.from({ length: parcels }, (_, index) =>
    index === parcels - 1 ? quantity - share * (parcels - 1) : share,
  );
};
