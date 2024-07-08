import { z } from 'zod';

export const createPricingSchema = z.object({
  from_city_id: z.string(),
  to_city_id: z.string(),
  package_id: z.string().optional(),
  price: z.number().positive(),
});

export type TCreatePricing = z.infer<typeof createPricingSchema>;

export const updatePricingSchema = z.object({
  from_city_id: z.string().optional(),
  to_city_id: z.string().optional(),
  package_id: z.string().optional(),
  price: z.number().positive().optional(),
});

export type TUpdatePricing = z.infer<typeof updatePricingSchema>;
