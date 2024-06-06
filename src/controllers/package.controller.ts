import { Request, Response } from 'express';
import * as packageService from '../dal/package.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreatePackage, TUpdatePackage } from '../schemas/package.schema';

export const createPackage = async (req: Request<unknown, unknown, TCreatePackage>, res: Response) => {
  try {
    const packageData = req.body;

    const newPackage = await packageService.createPackage(packageData);
    res.status(201).json(newPackage);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllPackages = async (req: Request, res: Response) => {
  try {
    const packages = await packageService.getAllPackages();

    res.json(packages);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(id);

    res.json(pkg);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updatePackage = async (req: Request<{ id: string }, unknown, TUpdatePackage>, res: Response) => {
  try {
    const { id } = req.params;
    const packageData = req.body;

    const updatedPackage = await packageService.updatePackage(id, packageData);

    res.json(updatedPackage);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await packageService.deletePackage(id);

    res.json({ message: 'Package Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
