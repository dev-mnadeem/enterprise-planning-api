import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string(),
  status: z.boolean(),
});

export type TCreateCountry = z.infer<typeof createCountrySchema>;

export const updateCountrySchema = z.object({
  name: z.string().optional(),
  status: z.boolean().optional(),
});

export type TUpdateCountry = z.infer<typeof updateCountrySchema>;
