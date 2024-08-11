import { Request, Response } from 'express';
import * as vehicleTypeService from '../dal/vehicleType.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';

export const getAllVehicleTypes = async (req: Request, res: Response) => {
  try {
    const vehicleTypes = await vehicleTypeService.getAllVehicleTypes();

    res.json(vehicleTypes);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
