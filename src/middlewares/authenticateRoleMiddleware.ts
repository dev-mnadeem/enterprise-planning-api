import { NextFunction, Request, Response } from 'express';

import { RequestWithCurrentUser } from '../types/user.interface';

export const authenticateRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as RequestWithCurrentUser).currentUser;

    if (!currentUser) {
      return res.status(403).json({ message: "You're not authorized to perform this action!" });
    }

    const userRole = currentUser.user_role;

    if (userRole.name !== role) {
      return res.status(403).json({ message: "Your role is not authorized to perform this action!" });
    }

    next();
  };
};
