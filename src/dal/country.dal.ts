import { Country } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateCountry, TUpdateCountry } from '../schemas/country.schema';

const countryRepository = AppDataSource.getRepository(Country);

export const getAllCountries = async (): Promise<Country[] | null> => {
  const countries = await countryRepository.find({ where: { status: true } });
  return countries;
};

export const getCountryById = async (id: string): Promise<Country | undefined> => {
  const country = await countryRepository.findOne({ where: { id } });

  if (!country) {
    throw new CustomError('Country Not Found!', 404);
  }

  return country;
};

export const updateCountry = async (id: string, newData: TUpdateCountry): Promise<Country | null> => {
  const countryToUpdate = await countryRepository.findOne({
    where: { id },
  });

  if (!countryToUpdate) {
    throw new CustomError('Country Not Found!', 404);
  }

  const updatedCountry = { ...countryToUpdate, ...newData };
  return await countryRepository.save(updatedCountry);
};
