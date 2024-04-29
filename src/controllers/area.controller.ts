import { Request, Response } from 'express';
import * as areaService from '../dal/area.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateArea, TUpdateArea } from '../schemas/area.schema';

export const createArea = async (req: Request<unknown, unknown, TCreateArea>, res: Response) => {
  try {
    const areaData = req.body;
    const newArea = await areaService.createArea(areaData);
    res.status(201).json(newArea);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllAreas = async (req: Request, res: Response) => {
  try {
    const areas = await areaService.getAllAreas();

    res.json(areas);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAreaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const area = await areaService.getAreaById(id);

    res.json(area);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateArea = async (req: Request<{ id: string }, unknown, TUpdateArea>, res: Response) => {
  try {
    const { id } = req.params;
    const areaData = req.body;

    const updatedArea = await areaService.updateArea(id, areaData);

    res.json(updatedArea);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await areaService.deleteArea(id);

    res.json({ message: 'Area Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
