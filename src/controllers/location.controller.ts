import { Request, Response } from 'express';
import * as locationService from '../dal/location.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateLocation, TUpdateLocation } from '../schemas/location.schema';

export const createLocation = async (req: Request<unknown, unknown, TCreateLocation>, res: Response) => {
  try {
    const locationData = req.body;
    const newLocation = await locationService.createLocation(locationData);
    res.status(201).json(newLocation);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await locationService.getAllLocations();

    res.json(locations);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const location = await locationService.getLocationById(id);

    res.json(location);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateLocation = async (req: Request<{ id: string }, unknown, TUpdateLocation>, res: Response) => {
  try {
    const { id } = req.params;
    const locationData = req.body;

    const updatedLocation = await locationService.updateLocation(id, locationData);

    res.json(updatedLocation);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await locationService.deleteLocation(id);

    res.json({ message: 'Location Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
