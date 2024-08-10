import { z } from 'zod';

export const orderInSchema = z.object({
  location_id: z.string(),
});

export type TOrderIn = z.infer<typeof orderInSchema>;

export const orderOutSchema = z.object({
  vehicle_id: z.string(),
  from_location_id: z.string(),
  to_location_id: z.string(),
});

export type TOrderOut = z.infer<typeof orderOutSchema>;
