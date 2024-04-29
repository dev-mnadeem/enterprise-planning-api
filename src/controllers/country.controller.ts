import { Request, Response } from 'express';
import * as countryService from '../dal/country.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateCountry, TUpdateCountry } from '../schemas/country.schema';

export const createCountry = async (req: Request<unknown, unknown, TCreateCountry>, res: Response) => {
  try {
    const countryData = req.body;
    const newArea = await countryService.createCountry(countryData);
    res.status(201).json(newArea);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllCountries = async (req: Request, res: Response) => {
  try {
    const countries = await countryService.getAllCountries();

    res.json(countries);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getCountryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const country = await countryService.getCountryById(id);

    res.json(country);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateCountry = async (req: Request<{ id: string }, unknown, TUpdateCountry>, res: Response) => {
  try {
    const { id } = req.params;
    const countryData = req.body;

    const updatedCountry = await countryService.updateCountry(id, countryData);

    res.json(updatedCountry);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteCountry = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await countryService.deleteCountry(id);

    res.json({ message: 'Country Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
