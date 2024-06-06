import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  weight_limit: z.number().positive().optional(),
  price: z.number().positive(),
});

export type TCreatePackage = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = z.object({
  name: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  weight_limit: z.number().positive().optional(),
  price: z.number().positive().optional(),
});

export type TUpdatePackage = z.infer<typeof updatePackageSchema>;
