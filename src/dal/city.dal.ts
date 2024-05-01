import { City } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateCity, TUpdateCity } from '../schemas/city.schema';

const cityRepository = AppDataSource.getRepository(City);

export const createCity = async (cityData: TCreateCity): Promise<City> => {
  const newCity = cityRepository.create(cityData);
  return await cityRepository.save(newCity);
};

export const getAllCities = async (): Promise<City[] | null> => {
  const cities = await cityRepository.find();
  return cities;
};

export const getCityById = async (id: string): Promise<City | undefined> => {
  const city = await cityRepository.findOneOrFail({ where: { id }, relations: { state: { country: true } } });

  if (!city) {
    throw new CustomError('City Not Found', 404);
  }

  return city;
};

export const updateCity = async (id: string, newData: TUpdateCity): Promise<City | null> => {
  const cityToUpdate = await cityRepository.findOneOrFail({
    where: { id },
  });

  if (!cityToUpdate) {
    throw new CustomError('City Not Found', 404);
  }

  const updatedCity = { ...cityToUpdate, ...newData };
  return await cityRepository.save(updatedCity);
};

export const deleteCity = async (id: string): Promise<boolean> => {
  const result = await cityRepository.delete(id);
  return result.affected !== 0;
};
