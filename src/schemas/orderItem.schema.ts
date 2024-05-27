import { z } from 'zod';

export const createOrderItemSchema = z.object({
  description: z.string().optional(),
  courier_type: z.string().optional(),
  quantity: z.number(),
  price: z.number().positive(),
  weight: z.string(),
  weight_type: z.string(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  total_price: z.number().positive(),
});

export type TCreateOrderItem = z.infer<typeof createOrderItemSchema>;

export const updateOrderItemSchema = z.object({
  id: z.string().optional(),  // include this for update
  description: z.string().optional(),
  courier_type: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().positive().optional(),
  weight: z.string().optional(),
  weight_type: z.string().optional(),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  total_price: z.number().positive().optional(),
});

export type TUpdateOrderItem = z.infer<typeof updateOrderItemSchema>;
