import { z } from 'zod';

export const createVehicleSchema = z.object({
  name: z.string(),
  model: z.string(),
  registration_number: z.string(),
  status: z.boolean().optional(),
  vehicle_type_id: z.string(),
  driver_id: z.string().optional(),
  tracking_number: z.string().optional(),
});

export type TCreateVehicle = z.infer<typeof createVehicleSchema>;

export const updateVehicleSchema = z.object({
  name: z.string().optional(),
  model: z.string().optional(),
  registration_number: z.string().optional(),
  status: z.boolean().optional(),
  vehicle_type_id: z.string().optional(),
  driver_id: z.string().optional(),
  tracking_number: z.string().optional(),
});

export type TUpdateVehicle = z.infer<typeof updateVehicleSchema>;
