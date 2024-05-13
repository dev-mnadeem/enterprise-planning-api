import { Country } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateCountry, TUpdateCountry } from '../schemas/country.schema';

const countryRepository = AppDataSource.getRepository(Country);

export const createCountry = async (countryData: TCreateCountry): Promise<Country> => {
  const newCountry = countryRepository.create(countryData);
  return await countryRepository.save(newCountry);
};

export const getAllCountries = async (): Promise<Country[] | null> => {
  const countries = await countryRepository.find({ where: { states: true }, relations: { states: { cities: true } } });
  return countries;
};

export const getCountryById = async (id: string): Promise<Country | undefined> => {
  const country = await countryRepository.findOneOrFail({ where: { id } });

  if (!country) {
    throw new CustomError('Country Not Found', 404);
  }

  return country;
};

export const updateCountry = async (id: string, newData: TUpdateCountry): Promise<Country | null> => {
  const countryToUpdate = await countryRepository.findOneOrFail({
    where: { id },
  });

  if (!countryToUpdate) {
    throw new CustomError('Country Not Found', 404);
  }

  const updatedCountry = { ...countryToUpdate, ...newData };
  return await countryRepository.save(updatedCountry);
};

export const deleteCountry = async (id: string): Promise<boolean> => {
  const result = await countryRepository.delete(id);
  return result.affected !== 0;
};
