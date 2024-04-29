import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role_id: z.string(),
  branch: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_number: z.string().optional(),
});

export type TCreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  password: z.string().min(8).optional(),
  role_id: z.string().optional(),
  branch: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_number: z.string().optional(),
  refresh_token: z.string().optional(),
});

export type TUpdateUser = z.infer<typeof updateUserSchema>;

export const loginSchema = createUserSchema.pick({ email: true, password: true });

export type TLogin = z.infer<typeof loginSchema>;
