import { z } from 'zod';
import { permissionSchema } from './permission.schema';

export const createUserRoleSchema = z.object({
  name: z.string(),
  permissions: z.array(permissionSchema).optional(),
});

export type TCreateUserRole = z.infer<typeof createUserRoleSchema>;

export const updateUserRoleSchema = z.object({
  name: z.string().optional(),
  permissions: z.array(permissionSchema).optional(),
});

export type TUpdateUserRole = z.infer<typeof updateUserRoleSchema>;
