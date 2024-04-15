import { z } from 'zod';
import { permissionSchema } from './permission.schema';

export const signUpUserSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(8),
  phone_number: z.string(),
});

export type TSignUpUser = z.infer<typeof signUpUserSchema>;

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone_number: z.string(),
  role_id: z.string(),
  city_id: z.string().optional(),
  address: z.string().optional(),
  geo_location: z.string().optional(),
  password: z.string().min(8).optional(),
  permissions: z.array(permissionSchema).optional(),
  location_ids: z.array(z.string()).optional(),
});

export type TCreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  role_id: z.string().optional(),
  city_id: z.string().optional(),
  address: z.string().optional(),
  geo_location: z.string().optional(),
  password: z.string().min(8).optional(),
  phone_number: z.string().optional(),
  status: z.boolean().optional(),
  permissions: z.array(permissionSchema).optional(),
  location_ids: z.array(z.string()).optional(),
});

export type TUpdateUser = z.infer<typeof updateUserSchema>;

/** Fields a user may not change on their own record unless they are an admin. */
export const PRIVILEGED_USER_FIELDS = ['role_id', 'permissions', 'status', 'location_ids'] as const;

export const findPrivilegedFields = (data: TUpdateUser): string[] =>
  PRIVILEGED_USER_FIELDS.filter((field) => data[field] !== undefined);

export const loginSchema = z
  .object({
    email: z.string().email().optional(),
    phone_number: z.string().optional(),
    password: z.string().min(8),
  })
  .refine((data) => Boolean(data.email || data.phone_number), {
    message: 'At least one of email or phone_number must be provided',
    path: ['email'],
  });

export type TLogin = z.infer<typeof loginSchema>;
