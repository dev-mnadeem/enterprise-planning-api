import { Pricing } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreatePricing, TUpdatePricing } from '../schemas/pricing.schema';
import { In } from 'typeorm';
import { PricingQueryParams } from '../types/pricing.interface';

const pricingRepository = AppDataSource.getRepository(Pricing);

export const createPricing = async (pricingData: TCreatePricing): Promise<Pricing> => {
  let createdPricing;

  const existingPricing = await pricingRepository.findOne({
    where: {
      from_city_id: pricingData.from_city_id,
      to_city_id: pricingData.to_city_id,
      package_id: pricingData.package_id,
      route: pricingData.route,
    },
    select: {
      id: true,
      price: true,
      route: true,
    },
    relations: {
      from_city: {
        state: {
          country: true,
        },
      },
      to_city: {
        state: {
          country: true,
        },
      },
      package: true,
    },
  });

  if (existingPricing) {
    const updatedPricing = { ...existingPricing, price: pricingData.price };
    createdPricing = await pricingRepository.save(updatedPricing);
  } else {
    const newPricing = pricingRepository.create(pricingData);
    createdPricing = await pricingRepository.save(newPricing);
  }

  return createdPricing;
};

export const getAllPricings = async (params: PricingQueryParams): Promise<Pricing[] | null> => {
  const { fromCityId, toCityId, packageId, route } = params;

  const query = pricingRepository
    .createQueryBuilder('pricing')
    .select()
    .leftJoinAndSelect('pricing.from_city', 'from_city')
    .leftJoinAndSelect('from_city.state', 'from_state')
    .leftJoinAndSelect('from_state.country', 'from_country')
    .leftJoinAndSelect('pricing.to_city', 'to_city')
    .leftJoinAndSelect('to_city.state', 'to_state')
    .leftJoinAndSelect('to_state.country', 'to_country')
    .leftJoinAndSelect('pricing.package', 'package')
    .where('pricing.status = :status', { status: 'approved' });

  if (fromCityId && toCityId && packageId) {
    query.andWhere(
      'pricing.from_city_id = :fromCityId AND pricing.to_city_id = :toCityId AND pricing.package_id = :packageId',
      { fromCityId, toCityId, packageId },
    );
  }

  if (route) {
    query.andWhere('pricing.route = :route', { route });
  }

  const pricings = await query.getMany();
  return pricings;
};

export const getPricingById = async (id: string): Promise<Pricing | undefined> => {
  const pricing = await pricingRepository.findOne({
    where: { id },
    relations: {
      from_city: {
        state: {
          country: true,
        },
      },
      to_city: {
        state: {
          country: true,
        },
      },
      package: true,
    },
  });

  if (!pricing) {
    throw new CustomError('Pricing Not Found!', 404);
  }

  return pricing;
};

export const updatePricing = async (id: string, newData: TUpdatePricing): Promise<Pricing | null> => {
  const pricingToUpdate = await pricingRepository.findOne({
    where: { id },
  });

  if (!pricingToUpdate) {
    throw new CustomError('Pricing Not Found!', 404);
  }

  const updatedPricing = { ...pricingToUpdate, ...newData };
  return await pricingRepository.save(updatedPricing);
};

export const deletePricing = async (id: string): Promise<boolean> => {
  const result = await pricingRepository.delete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Pricing Not Found!', 404);
  }

  return isDeleted;
};
