import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Replaces req.body with the parsed value, so keys the schema does not declare
 * never reach a controller. The DAL spreads request bodies straight into
 * entities, which made every undeclared column writable.
 */
export const validateZodMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(422).json({ errors: result.error.issues });
    }

    req.body = result.data;
    return next();
  };
};
