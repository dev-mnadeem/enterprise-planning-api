import { City } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TUpdateCity } from '../schemas/city.schema';

const cityRepository = AppDataSource.getRepository(City);

export const getAllCities = async (): Promise<City[] | null> => {
  const cities = await cityRepository.find({ relations: { state: { country: true } } });
  return cities;
};

export const getCityById = async (id: string): Promise<City | undefined> => {
  const city = await cityRepository.findOne({ where: { id }, relations: { state: { country: true } } });

  if (!city) {
    throw new CustomError('City Not Found!', 404);
  }

  return city;
};

export const getCitiesByStateId = async (state_id: string): Promise<City[] | undefined> => {
  const states = await cityRepository.find({ where: { state_id } });

  return states;
};

export const updateCity = async (id: string, newData: TUpdateCity): Promise<City | null> => {
  const cityToUpdate = await cityRepository.findOne({
    where: { id },
  });

  if (!cityToUpdate) {
    throw new CustomError('City Not Found!', 404);
  }

  const updatedCity = { ...cityToUpdate, ...newData };
  return await cityRepository.save(updatedCity);
};
