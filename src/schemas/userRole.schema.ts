import { z } from 'zod';

export const createUserRoleSchema = z.object({
  name: z.string(),
});

export type TCreateUserRole = z.infer<typeof createUserRoleSchema>;

export const updateUserRoleSchema = z.object({
  name: z.string().optional(),
});

export type TUpdateUserRole = z.infer<typeof updateUserRoleSchema>;
