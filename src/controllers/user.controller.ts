import { Request, Response } from 'express';
import * as userService from '../dal/user.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateUser, TUpdateUser } from '../schemas/user.schema';
import { hashPassword } from '../utils/passwordUtils';

export const createUser = async (req: Request<unknown, unknown, TCreateUser>, res: Response) => {
  try {
    const { name, email, phone_number, address, geo_location, role_id, city_id, permissions } = req.body;

    const encryptedPassword = await hashPassword('Helloworld');

    const userData = {
      name,
      email,
      password: encryptedPassword,
      phone_number,
      address,
      geo_location,
      role_id,
      city_id,
      permissions
    };

    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();

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
