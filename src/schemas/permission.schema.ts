import { z } from 'zod';

export const createPermissionSchema = z.object({
  name: z.string(),
  properties: z.object({ add: z.boolean(), view: z.boolean(), update: z.boolean(), remove: z.boolean() }),
});

export type TCreatePermission = z.infer<typeof createPermissionSchema>;
