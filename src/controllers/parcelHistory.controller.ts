import { Request, Response } from 'express';
import * as parcelHistoryService from '../dal/parcelHistory.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TParcelIn, TParcelOut, TParcelsIn, TParcelsOut } from '../schemas/parcelHistory.schema';

export const parcelIn = async (req: Request<{ id: string }, unknown, TParcelIn>, res: Response) => {
  try {
    const { id } = req.params;
    const parcelHistoryData = req.body;

    const newParcel = await parcelHistoryService.parcelIn({ ...parcelHistoryData, parcel_numbers: [id] });
    res.status(200).json(newParcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const parcelsIn = async (req: Request<unknown, unknown, TParcelsIn>, res: Response) => {
  try {
    const parcelHistoryData = req.body;

    const newParcel = await parcelHistoryService.parcelIn(parcelHistoryData);
    res.status(200).json(newParcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const parcelOut = async (req: Request<{ id: string }, unknown, TParcelOut>, res: Response) => {
  try {
    const { id } = req.params;
    const parcelHistoryData = req.body;

    const newParcel = await parcelHistoryService.parcelOut({ ...parcelHistoryData, parcel_numbers: [id] });
    res.status(200).json(newParcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const parcelsOut = async (req: Request<unknown, unknown, TParcelsOut>, res: Response) => {
  try {
    const parcelHistoryData = req.body;

    const newParcel = await parcelHistoryService.parcelOut(parcelHistoryData);
    res.status(200).json(newParcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getContainerParcelsByTrackingNumber = async (req: Request, res: Response) => {
  try {
    const { tracking_number } = req.params;
    const parcels = await parcelHistoryService.getContainerParcelsByTrackingNumber(tracking_number);

    res.json(parcels);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
