import { z } from 'zod';
import { createPermissionSchema } from './permission.schema';

export const signUpUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phone_number: z.string().optional(),
});

export type TSignUpUser = z.infer<typeof signUpUserSchema>;

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  role_id: z.string(),
  city_id: z.string().optional(),
  address: z.string().optional(),
  geo_location: z.string().optional(),
  password: z.string().min(8).optional(),
  phone_number: z.string().optional(),
  permissions: z.array(createPermissionSchema).optional(),
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
  refresh_token: z.string().optional(),
  permissions: z.array(createPermissionSchema).optional(),
});

export type TUpdateUser = z.infer<typeof updateUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type TLogin = z.infer<typeof loginSchema>;
