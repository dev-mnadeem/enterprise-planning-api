import { Request, Response } from 'express';
import * as stateService from '../dal/state.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TUpdateState } from '../schemas/state.schema';


export const getAllStates = async (req: Request, res: Response) => {
  try {
    const states = await stateService.getAllStates();

    res.json(states);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getStateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await stateService.getStateById(id);

    res.json(state);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getStatesByCountryId = async (req: Request, res: Response) => {
  try {
    const { country_id } = req.params;
    const states = await stateService.getStatesByCountryId(country_id);

    res.json(states);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateState = async (req: Request<{ id: string }, unknown, TUpdateState>, res: Response) => {
  try {
    const { id } = req.params;
    const stateData = req.body;

    const updatedState = await stateService.updateState(id, stateData);

    res.json(updatedState);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
