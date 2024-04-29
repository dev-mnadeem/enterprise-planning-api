import { z } from 'zod';

export const createCitySchema = z.object({
  name: z.string(),
  country_id: z.string(),
});

export type TCreateCity = z.infer<typeof createCitySchema>;

export const updateCitySchema = z.object({
  name: z.string().optional(),
  country_id: z.string().optional(),
});

export type TUpdateCity = z.infer<typeof updateCitySchema>;
