import { Request, Response } from 'express';
import * as cityService from '../dal/city.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateCity } from '../schemas/city.schema';

export const createCity = async (req: Request<unknown, unknown, TCreateCity>, res: Response) => {
  try {
    const cityData = req.body;
    const newArea = await cityService.createCity(cityData);
    res.status(201).json(newArea);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllCities = async (req: Request, res: Response) => {
  try {
    const cities = await cityService.getAllCities();

    res.json(cities);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getCityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await cityService.getCityById(id);

    res.json(city);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cityData = req.body;

    const updatedCity = await cityService.updateCity(id, cityData);

    res.json(updatedCity);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await cityService.deleteCity(id);

    res.json({ message: 'City Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
