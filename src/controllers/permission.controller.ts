import { Request, Response } from 'express';
import * as permissionService from '../dal/permission.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreatePermission } from '../schemas/permission.schema';

export const createPermission = async (req: Request<never, never, TCreatePermission>, res: Response) => {
  try {
    const permissionData = req.body;
    const newPermission = await permissionService.createPermission(permissionData);
    res.status(201).json(newPermission);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getAllPermissions();

    res.json(permissions);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
