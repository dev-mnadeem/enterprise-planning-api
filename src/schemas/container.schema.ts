import { z } from 'zod';

const volumeUnitEnum = z.enum(['cbm']);

export const createContainerSchema = z
  .object({
    from_country_id: z.string(),
    to_country_id: z.string(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    depth: z.number().nonnegative().optional(),
    volume: z.number().nonnegative().optional(),
    volume_unit: volumeUnitEnum.optional(),
    tracking_number: z.string().optional(),
  })
  .refine((data) => data.from_country_id !== data.to_country_id, {
    message: 'from_country and to_country cannot be the same',
    path: ['to_country_id'],
  });

export type TCreateContainer = z.infer<typeof createContainerSchema>;

export const updateContainerSchema = z
  .object({
    from_country_id: z.string().optional(),
    to_country_id: z.string().optional(),
    width: z.number().nonnegative().optional(),
    height: z.number().nonnegative().optional(),
    depth: z.number().nonnegative().optional(),
    volume: z.number().nonnegative().optional(),
    volume_unit: volumeUnitEnum.optional(),
    tracking_number: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.from_country_id && data.to_country_id) {
        return data.from_country_id !== data.to_country_id;
      }
      return true;
    },
    {
      message: 'from_country and to_country cannot be the same',
      path: ['to_country_id'],
    },
  );

export type TUpdateContainer = z.infer<typeof updateContainerSchema>;

export const addItemsToContainerSchema = z.object({
  order_numbers: z
    .array(z.string())
    .min(1)
    .refine((orderNumbers) => new Set(orderNumbers).size === orderNumbers.length, {
      message: 'Order numbers must be unique',
    }),
});

export type TAddItemsToContainer = z.infer<typeof addItemsToContainerSchema>;
