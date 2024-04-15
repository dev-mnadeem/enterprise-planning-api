import { z } from 'zod';

export const createCountrySchema = z.object({
  name: z.string(),
  code: z.string().toUpperCase().min(2),
  status: z.boolean(),
});

export type TCreateCountry = z.infer<typeof createCountrySchema>;

export const updateCountrySchema = z.object({
  name: z.string().optional(),
  code: z.string().toUpperCase().min(2).optional(),
  status: z.boolean().optional(),
});

export type TUpdateCountry = z.infer<typeof updateCountrySchema>;
