import { z } from 'zod';

export const parcelInSchema = z.object({
  location_id: z.string(),
});

export type TParcelIn = z.infer<typeof parcelInSchema>;

export const parcelsInSchema = z.intersection(
  parcelInSchema,
  z.object({
    parcel_numbers: z.array(z.string()).min(1),
  }),
);

export type TParcelsIn = z.infer<typeof parcelsInSchema>;

export const parcelOutSchema = z.object({
  vehicle_id: z.string(),
  from_location_id: z.string(),
  to_location_id: z.string().optional(),
});

export type TParcelOut = z.infer<typeof parcelOutSchema>;

export const parcelsOutSchema = z.intersection(
  parcelOutSchema,
  z.object({
    parcel_numbers: z.array(z.string()).min(1),
  }),
);

export type TParcelsOut = z.infer<typeof parcelsOutSchema>;
