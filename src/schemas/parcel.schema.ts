import { z } from 'zod';

export const parcelSchema = z.object({
  location_id: z.string(),
  parcel_data: z.array(
    z.object({
      item_id: z.string(),
      number_of_barcodes: z.number(),
    }),
  ),
});

export type TCreateParcel = z.infer<typeof parcelSchema>;

export type TUpdateParcel = z.infer<typeof parcelSchema>;
