import { Location } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateLocation, TUpdateLocation } from '../schemas/location.schema';

const locationRepository = AppDataSource.getRepository(Location);

export const createLocation = async (locationData: TCreateLocation): Promise<Location> => {
  const newLocation = locationRepository.create(locationData);
  return await locationRepository.save(newLocation);
};

export const getAllLocations = async (): Promise<Location[] | null> => {
  const locations = await locationRepository.find({ where: { deleted_at: undefined } });
  return locations;
};

export const getLocationById = async (id: string): Promise<Location | undefined> => {
  const location = await locationRepository.findOneOrFail({ where: { id } });

  if (!location) {
    throw new CustomError('Location Not Found', 404);
  }

  return location;
};

export const updateLocation = async (id: string, newData: TUpdateLocation): Promise<Location | null> => {
  const locationToUpdate = await locationRepository.findOneOrFail({
    where: { id },
  });

  if (!locationToUpdate) {
    throw new CustomError('Location Not Found', 404);
  }

  const updatedLocation = { ...locationToUpdate, ...newData };
  return await locationRepository.save(updatedLocation);
};

export const deleteLocation = async (id: string): Promise<boolean> => {
  const result = await locationRepository.softDelete(id);
  return result.affected !== 0;
};
