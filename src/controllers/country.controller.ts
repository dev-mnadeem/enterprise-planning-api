import { Request, Response } from 'express';
import * as countryService from '../dal/country.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TUpdateCountry } from '../schemas/country.schema';

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
