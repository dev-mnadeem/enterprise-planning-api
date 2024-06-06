import { z } from 'zod';
import { createOrderItemSchema, updateOrderItemSchema } from './orderItem.schema'; // Adjust the import path as needed
import { createLocationSchema } from './location.schema'; 
import { createPackageSchema } from './package.schema';

const orderStatusEnum = z.enum([
  'pending',
  'in_process',
  'in_route',
  'delivered',
  'cancelled',
  'return_in_progress',
]);

export const createOrderSchema = z.object({
  user_id: z.string(),
  order_number: z.string(),
  shipping_date: z.string().datetime().optional(),
  collection_time: z.string().datetime().optional(),
  sender_id: z.string().optional(),
  sender_name: z.string(),
  sender_email: z.string().optional(),
  sender_phone: z.string(),
  sender_address: z.string(),
  sender_city_id: z.string(),
  receiver_id: z.string().optional(),
  receiver_name: z.string(),
  receiver_email: z.string().optional(),
  receiver_phone: z.string(),
  receiver_address: z.string(),
  receiver_city_id: z.string(),
  total_quantity: z.number().nonnegative(),
  sub_total: z.number().positive(),
  discount: z.number().nonnegative(),
  total_amount: z.number().positive(),
  payment_type: z.string(),
  payment_status: z.string(),
  payment_date: z.string().datetime(),
  status: orderStatusEnum.optional(),
  locations: z.array(createLocationSchema).optional(),
  packages: z.array(createPackageSchema).optional(),
  orderItems: z.array(createOrderItemSchema),
});

export type TCreateOrder = z.infer<typeof createOrderSchema>;

export const updateOrderSchema = z.object({
  id: z.string().optional(), // include this for update
  user_id: z.string().optional(),
  order_number: z.string().optional(),
  shipping_date: z.string().datetime().optional(),
  collection_time: z.string().datetime().optional(),
  sender_id: z.string().optional(),
  sender_name: z.string().optional(),
  sender_email: z.string().optional(),
  sender_phone: z.string().optional(),
  sender_address: z.string().optional(),
  sender_city_id: z.string().optional(),
  receiver_id: z.string().optional(),
  receiver_name: z.string().optional(),
  receiver_email: z.string().optional(),
  receiver_phone: z.string().optional(),
  receiver_address: z.string().optional(),
  receiver_city_id: z.string().optional(),
  total_quantity: z.number().nonnegative().optional(),
  sub_total: z.number().positive().optional(),
  discount: z.number().nonnegative().optional(),
  total_amount: z.number().positive().optional(),
  payment_type: z.string().optional(),
  payment_status: z.string().optional(),
  payment_date: z.string().datetime().optional(),
  status: orderStatusEnum.optional(),
  locations: z.array(createLocationSchema).optional(),
  packages: z.array(createPackageSchema).optional(),
  orderItems: z.array(updateOrderItemSchema).optional(),
});

export type TUpdateOrder = z.infer<typeof updateOrderSchema>;
