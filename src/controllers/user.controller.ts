import { Request, Response } from 'express';
import * as userService from '../dal/user.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateUser, TUpdateUser, findPrivilegedFields } from '../schemas/user.schema';
import { hashPassword } from '../utils/passwordUtils';
import { RequestWithCurrentUser, UserQueryParams, queryParamToUserParam } from '../types/user.interface';
import { CustomError } from '../utils/customError';

// Staff accounts created from the admin panel start with this password unless
// one is supplied; the frontend's "New User" form does not send one.
const DEFAULT_STAFF_PASSWORD = 'Helloworld';

export const createUser = async (req: Request<unknown, unknown, TCreateUser>, res: Response) => {
  try {
    const { name, email, phone_number, address, geo_location, role_id, city_id, permissions, location_ids, password } =
      req.body;

    const encryptedPassword = await hashPassword(password ?? DEFAULT_STAFF_PASSWORD);

    const userData = {
      name,
      email,
      password: encryptedPassword,
      phone_number,
      address,
      geo_location,
      role_id,
      city_id,
      permissions,
      location_ids
    };

    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const params: UserQueryParams = queryParamToUserParam(req);
    const users = await userService.getAllUsers(params);

    res.json(users);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    res.json(user);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateUser = async (req: Request<{ id: string }, unknown, TUpdateUser>, res: Response) => {
  try {
    const { id } = req.params;
    const userData = req.body;
    const currentUser = (req as unknown as RequestWithCurrentUser).currentUser;

    // authenticateRoleOrSelf lets anyone edit their own record. Without this a
    // customer could hand themselves a staff role, permissions or locations.
    const isOwnRecord = currentUser.id === id;
    const privileged = findPrivilegedFields(userData);
    if (isOwnRecord && currentUser.user_role?.name !== 'admin' && privileged.length) {
      throw new CustomError(`You cannot change your own ${privileged.join(', ')}.`, 403);
    }

    const updatedUser = await userService.updateUser(id, userData);

    res.json(updatedUser);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await userService.deleteUser(id);

    res.json({ message: 'User Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
