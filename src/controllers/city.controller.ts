import { Request, Response } from 'express';
import * as cityService from '../dal/city.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TUpdateCity } from '../schemas/city.schema';

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

export const getCitiesByStateId = async (req: Request, res: Response) => {
  try {
    const { state_id } = req.params;
    const cities = await cityService.getCitiesByStateId(state_id);

    res.json(cities);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateCity = async (req: Request<{ id: string }, unknown, TUpdateCity>, res: Response) => {
  try {
    const { id } = req.params;
    const cityData = req.body;

    const updatedCity = await cityService.updateCity(id, cityData);

    res.json(updatedCity);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
