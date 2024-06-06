import { z } from 'zod';

export const createOrderItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  courier_type: z.string().optional(),
  quantity: z.number(),
  price: z.number().positive(),
  weight: z.number(),
  weight_type: z.string(),
  length: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  total_price: z.number().positive(),
});

export type TCreateOrderItem = z.infer<typeof createOrderItemSchema>;

export const updateOrderItemSchema = z.intersection(
  createOrderItemSchema,
  z.object({
    id: z.string(), // include this for update
  }),
);

export type TUpdateOrderItem = z.infer<typeof updateOrderItemSchema>;
