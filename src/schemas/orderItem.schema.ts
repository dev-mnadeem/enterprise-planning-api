import { z } from 'zod';

export const createOrderItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number(),
  weight: z.number(),
});

export type TCreateOrderItem = z.infer<typeof createOrderItemSchema>;

export const updateOrderItemSchema = z.intersection(
  createOrderItemSchema,
  z.object({
    id: z.string(), // include this for update
  }),
);

export type TUpdateOrderItem = z.infer<typeof updateOrderItemSchema>;
