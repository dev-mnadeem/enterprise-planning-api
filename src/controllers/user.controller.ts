import { Request, Response } from 'express';
import * as userService from '../dal/user.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const user = await userService.getAllUsers(q as string | undefined);

    res.json(user);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
