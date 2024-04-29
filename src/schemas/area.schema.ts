import { z } from 'zod';

export const createAreaSchema = z.object({
  name: z.string(),
  postal_code: z.string(),
  country_id: z.string(),
  city_id: z.string(),
  status: z.boolean(),
});

export type TCreateArea = z.infer<typeof createAreaSchema>;

export const updateAreaSchema = z.object({
  name: z.string().optional(),
  postal_code: z.string().optional(),
  country_id: z.string().optional(),
  city_id: z.string().optional(),
  status: z.boolean().optional(),
});

export type TUpdateArea = z.infer<typeof updateAreaSchema>;
