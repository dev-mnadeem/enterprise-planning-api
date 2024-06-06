import { Package } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreatePackage, TUpdatePackage } from '../schemas/package.schema';

const packageRepository = AppDataSource.getRepository(Package);

export const createPackage = async (packageData: TCreatePackage): Promise<Package> => {
  const newPackage = packageRepository.create(packageData);
  return await packageRepository.save(newPackage);
};

export const getAllPackages = async (): Promise<Package[] | null> => {
  const packages = await packageRepository.find();
  return packages;
};

export const getPackageById = async (id: string): Promise<Package | undefined> => {
  const pkg = await packageRepository.findOne({ where: { id } });

  if (!pkg) {
    throw new CustomError('Package Not Found!', 404);
  }

  return pkg;
};

export const updatePackage = async (id: string, newData: TUpdatePackage): Promise<Package | null> => {
  const packageToUpdate = await packageRepository.findOne({
    where: { id },
  });

  if (!packageToUpdate) {
    throw new CustomError('Package Not Found!', 404);
  }

  const updatedPackage = { ...packageToUpdate, ...newData };
  return await packageRepository.save(updatedPackage);
};

export const deletePackage = async (id: string): Promise<boolean> => {
  const result = await packageRepository.delete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Package Not Found!', 404);
  }

  return isDeleted
};
