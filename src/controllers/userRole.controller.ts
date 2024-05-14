import { Request, Response } from 'express';
import * as userRoleService from '../dal/userRole.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateUserRole } from '../schemas/userRole.schema';

export const createUserRole = async (req: Request<never, never, TCreateUserRole>, res: Response) => {
  try {
    const { name, permissions } = req.body;

    const newUserRole = await userRoleService.createUserRole(name, permissions);

    res.status(201).json(newUserRole);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getUserRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userRole = await userRoleService.getUserRoleById(id);

    res.json(userRole);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllUserRoles = async (req: Request, res: Response) => {
  try {
    const userRoles = await userRoleService.getAllUserRoles();

    res.json(userRoles);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedUserRole = await userRoleService.updateUserRole(id, name);

    res.json(updatedUserRole);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await userRoleService.deleteUserRole(id);

    res.json({ message: 'User Role Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
