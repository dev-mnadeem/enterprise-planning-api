import { z } from 'zod';

const orderWeightEnum = z.enum(['lbs', 'kg', 'cbm']);
const orderRouteEnum = z.enum(['road', 'air', 'sea']);

export const createPackageSchema = z.object({
  name: z.string(),
  weight_type: orderWeightEnum,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  weight_limit: z.number().positive().optional(),
  route: orderRouteEnum,
}).superRefine((data, ctx) => {
  if (data.route === 'sea' && data.weight_type !== 'cbm') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "For sea route, weight_type must be 'cbm'.",
      path: ['weight_type'],
    });
  }

  if (data.weight_type === 'cbm') {
    if (!data.width || !data.height || !data.depth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Width, height, and depth are required when weight_type is 'cbm'.",
        path: ['width', 'height', 'depth'],
      });
    }
  }

  if (data.route !== 'sea' && (data.weight_type === 'kg' || data.weight_type === 'lbs')) {
    if (!data.weight_limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight limit is required for air or road routes.",
        path: ['weight_limit'],
      });
    }
  }
});

export type TCreatePackage = z.infer<typeof createPackageSchema>;

export const updatePackageSchema = z.object({
  name: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  depth: z.number().positive().optional(),
  weight_type: orderWeightEnum.optional(),
  weight_limit: z.number().positive().optional(),
  route: orderRouteEnum.optional(),
}).superRefine((data, ctx) => {
  if (data.route === 'sea' && data.weight_type !== 'cbm') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "For sea route, weight_type must be 'cbm'.",
      path: ['weight_type'],
    });
  }

  if (data.weight_type === 'cbm') {
    if (!data.width || !data.height || !data.depth) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Width, height, and depth are required when weight_type is 'cbm'.",
        path: ['width', 'height', 'depth'],
      });
    }
  }

  if (data.route !== 'sea' && (data.weight_type === 'kg' || data.weight_type === 'lbs')) {
    if (!data.weight_limit) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weight limit is required for air or road routes.",
        path: ['weight_limit'],
      });
    }
  }
});

export type TUpdatePackage = z.infer<typeof updatePackageSchema>;
