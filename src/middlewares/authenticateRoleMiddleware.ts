import { NextFunction, Request, Response } from 'express';

import { RequestWithCurrentUser } from '../types/user.interface';

const UNAUTHORIZED = "You're not authorized to perform this action!";
const WRONG_ROLE = 'Your role is not authorized to perform this action!';

/**
 * Restrict a route to one or more role names. Must run after authenticateJWT,
 * which is what loads currentUser and its user_role relation.
 */
export const authenticateRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as RequestWithCurrentUser).currentUser;

    if (!currentUser) {
      return res.status(403).json({ message: UNAUTHORIZED });
    }

    // Deny rather than throw when the relation is missing. Reading .name off
    // an unloaded relation used to crash the request with a TypeError.
    const roleName = currentUser.user_role?.name;

    if (!roleName || !roles.includes(roleName)) {
      return res.status(403).json({ message: WRONG_ROLE });
    }

    return next();
  };
};

/**
 * Allow the listed roles, or any user acting on their own record.
 * Used so a customer can read and edit themselves without being able to
 * enumerate or delete anybody else.
 */
export const authenticateRoleOrSelf = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as RequestWithCurrentUser).currentUser;

    if (!currentUser) {
      return res.status(403).json({ message: UNAUTHORIZED });
    }

    if (req.params.id && req.params.id === currentUser.id) {
      return next();
    }

    const roleName = currentUser.user_role?.name;

    if (!roleName || !roles.includes(roleName)) {
      return res.status(403).json({ message: WRONG_ROLE });
    }

    return next();
  };
};
