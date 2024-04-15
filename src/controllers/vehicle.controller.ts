import { Request, Response } from 'express';
import * as vehicleService from '../dal/vehicle.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateVehicle, TUpdateVehicle } from '../schemas/vehicle.schema';

export const createVehicle = async (req: Request<unknown, unknown, TCreateVehicle>, res: Response) => {
  try {
    const vehicleData = req.body;
    const newVehicle = await vehicleService.createVehicle(vehicleData);
    res.status(201).json(newVehicle);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();

    res.json(vehicles);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getVehicleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehicle = await vehicleService.getVehicleById(id);

    res.json(vehicle);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateVehicle = async (req: Request<{ id: string }, unknown, TUpdateVehicle>, res: Response) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;

    const updatedVehicle = await vehicleService.updateVehicle(id, vehicleData);

    res.json(updatedVehicle);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await vehicleService.deleteVehicle(id);

    res.json({ message: 'Vehicle Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
