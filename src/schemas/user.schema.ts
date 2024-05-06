import { z } from 'zod';

export const signUpUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  phone_number: z.string().optional(),
  mobile_number: z.string().optional(),
});

export type TSignUpUser = z.infer<typeof signUpUserSchema>;

export const createUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().email(),
  role_id: z.string(),
  password: z.string().min(8).optional(),
  phone_number: z.string().optional(),
  mobile_number: z.string().optional(),
});

export type TCreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  role_id: z.string().optional(),
  password: z.string().min(8).optional(),
  phone_number: z.string().optional(),
  mobile_number: z.string().optional(),
  refresh_token: z.string().optional(),
});

export type TUpdateUser = z.infer<typeof updateUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type TLogin = z.infer<typeof loginSchema>;
