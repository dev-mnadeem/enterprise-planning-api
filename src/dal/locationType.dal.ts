import { LocationType } from '../entities';
import { AppDataSource } from '../database/data-source';

const locationTypeRepository = AppDataSource.getRepository(LocationType);

export const getAllLocationTypes = async (): Promise<LocationType[] | null> => {
  const locationTypes = await locationTypeRepository.find();
  return locationTypes;
};
