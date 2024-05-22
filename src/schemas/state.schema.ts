import { z } from 'zod';

export const createStateSchema = z.object({
  name: z.string(),
  code: z.string().toUpperCase(),
});

export type TCreateState = z.infer<typeof createStateSchema>;

export const updateStateSchema = z.object({
  name: z.string().optional(),
  code: z.string().toUpperCase().optional(),
});

export type TUpdateState = z.infer<typeof updateStateSchema>;
