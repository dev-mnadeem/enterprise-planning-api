import { Request, Response } from 'express';
import * as pricingService from '../dal/pricing.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreatePricing, TUpdatePricing } from '../schemas/pricing.schema';
import { PricingQueryParams, queryParamToPricingParam } from '../types/pricing.interface';

export const createPricing = async (req: Request<unknown, unknown, TCreatePricing>, res: Response) => {
  try {
    const pricingData = req.body;
    const newPricing = await pricingService.createPricing(pricingData);
    res.status(201).json(newPricing);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllPricings = async (req: Request, res: Response) => {
  try {
    const params: PricingQueryParams = queryParamToPricingParam(req);
    const pricings = await pricingService.getAllPricings(params);

    res.json(pricings);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getPricingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pricing = await pricingService.getPricingById(id);

    res.json(pricing);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updatePricing = async (req: Request<{ id: string }, unknown, TUpdatePricing>, res: Response) => {
  try {
    const { id } = req.params;
    const pricingData = req.body;

    const updatedPricing = await pricingService.updatePricing(id, pricingData);

    res.json(updatedPricing);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deletePricing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await pricingService.deletePricing(id);

    res.json({ message: 'Pricing Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
