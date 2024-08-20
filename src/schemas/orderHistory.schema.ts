import { z } from 'zod';

export const orderInSchema = z.object({
  location_id: z.string(),
});

export type TOrderIn = z.infer<typeof orderInSchema>;

export const ordersInSchema = z.intersection(
  orderInSchema,
  z.object({
    order_numbers: z.array(z.string()).min(1),
  }),
);

export type TOrdersIn = z.infer<typeof ordersInSchema>;

export const orderOutSchema = z.object({
  vehicle_id: z.string(),
  from_location_id: z.string(),
  to_location_id: z.string().optional(),
});

export type TOrderOut = z.infer<typeof orderOutSchema>;

export const ordersOutSchema = z.intersection(
  orderOutSchema,
  z.object({
    order_numbers: z.array(z.string()).min(1),
  }),
);

export type TOrdersOut = z.infer<typeof ordersOutSchema>;
