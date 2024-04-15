import { Request, Response } from 'express';
import * as locationTypeService from '../dal/locationType.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';

export const getAllLocationTypes = async (req: Request, res: Response) => {
  try {
    const locationTypes = await locationTypeService.getAllLocationTypes();

    res.json(locationTypes);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
