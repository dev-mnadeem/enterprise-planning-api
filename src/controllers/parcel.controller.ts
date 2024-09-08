import { Request, Response } from 'express';
import * as parcelService from '../dal/parcel.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateParcel, TUpdateParcel } from '../schemas/parcel.schema';
import { RequestWithCurrentUser } from '../types/user.interface';
import { ParcelQueryParams, queryParamToParcelParam } from '../types/parcel.interface';

export const createParcel = async (req: Request<unknown, unknown, TCreateParcel>, res: Response) => {
  try {
    const parcelData = req.body;

    const newParcel = await parcelService.createParcel(parcelData);
    res.status(201).json(newParcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const validateInParcelNumber = async (req: Request, res: Response) => {
  const { number } = req.params;

  const isValid = await parcelService.validateParcelNumber(number, 'in');

  res.json(isValid);
};

export const validateOutParcelNumber = async (req: Request, res: Response) => {
  const { number } = req.params;

  const isValid = await parcelService.validateParcelNumber(number, 'out');

  res.json(isValid);
};

export const getAllParcels = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as RequestWithCurrentUser).currentUser;
    const params: ParcelQueryParams = queryParamToParcelParam(req);
    const parcels = await parcelService.getAllParcels(currentUser, params);

    res.json(parcels);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getParcelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parcel = await parcelService.getParcelById(id);

    res.json(parcel);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

// export const updateParcel = async (req: Request, res: Response) => {
//   try {
//     const { id: userId } = (req as RequestWithCurrentUser).currentUser;
//     const { id } = req.params;
//     const parcelData: TUpdateParcel = req.body;

//     const updatedParcel = await parcelService.updateParcel(userId, id, parcelData);

//     res.json(updatedParcel);
//   } catch (error) {
//     sendErrorResponse(error as Error, res);
//   }
// };

export const deleteParcel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await parcelService.deleteParcel(id);

    res.json({ message: 'Parcel Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
