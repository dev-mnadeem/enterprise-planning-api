import { z } from 'zod';

export const createLocationSchema = z.object({
  name: z.string(),
  description: z.string(),
  location_type_id: z.string(),
  city_id: z.string(),
  status: z.boolean(),
  type: z.string().optional(),
  geo_location: z.string().optional(),
});

export type TCreateLocation = z.infer<typeof createLocationSchema>;

export const updateLocationSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  location_type_id: z.string().optional(),
  city_id: z.string().optional(),
  status: z.boolean().optional(),
  type: z.string().optional(),
  geo_location: z.string().optional(),
});

export type TUpdateLocation = z.infer<typeof updateLocationSchema>;
