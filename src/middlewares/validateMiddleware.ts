import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validateZodMiddleware = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({ errors: error.issues });
      }
      return res.status(500).json({message: 'Internal server error!'});
    }

    next();
  };
};
