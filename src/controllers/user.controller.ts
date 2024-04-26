import { Request, Response } from 'express';
import * as userService from '../dal/user.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateUser } from '../schemas/user.schema';

export const createUser = async (req: Request<unknown, unknown, TCreateUser>, res: Response) => {
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const user = await userService.getAllUsers();

    res.json(user);
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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedUserRole = await userService.updateUser(id, name);

    res.json(updatedUserRole);
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
