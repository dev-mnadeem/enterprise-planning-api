import { Request, Response } from 'express';
import * as permissionService from '../dal/permission.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await permissionService.getAllPermissions();

    res.json(permissions);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
