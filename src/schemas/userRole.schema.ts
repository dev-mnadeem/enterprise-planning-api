import { z } from 'zod';
import { createPermissionSchema } from './permission.schema';

export const createUserRoleSchema = z.object({
  name: z.string(),
  permissions: z.array(createPermissionSchema).optional(),
});

export type TCreateUserRole = z.infer<typeof createUserRoleSchema>;

export const updateUserRoleSchema = z.object({
  name: z.string().optional(),
  permissions: z.array(createPermissionSchema).optional(),
});

export type TUpdateUserRole = z.infer<typeof updateUserRoleSchema>;
