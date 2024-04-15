import { randomInt } from 'crypto';

/**
 * Numeric identifiers printed on barcodes: order numbers, parcel numbers and
 * vehicle/container tracking numbers. Millisecond timestamp plus six random
 * digits, zero-padded so every number has the same length (19 digits).
 * The old generators did not pad, so lengths varied with the random part.
 */
export const generateShipmentNumber = (): string =>
  `${Date.now()}${randomInt(0, 1_000_000).toString().padStart(6, '0')}`;
