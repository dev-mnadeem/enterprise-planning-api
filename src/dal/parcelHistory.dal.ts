import { Location, ParcelHistory, Vehicle } from '../entities';
import { AppDataSource } from '../database/data-source';
import { getParcelByNumber } from './parcel.dal';
import { CustomError } from '../utils/customError';
import { TParcelsIn, TParcelsOut } from '../schemas/parcelHistory.schema';

const parcelHistoryRepository = AppDataSource.getRepository(ParcelHistory);
const locationRepository = AppDataSource.getRepository(Location);
const vehicleRepository = AppDataSource.getRepository(Vehicle);

export const parcelIn = async (newData: TParcelsIn): Promise<{ success: string[]; failed: string[] }> => {
  const { parcel_numbers, location_id } = newData;
  const success: string[] = [];
  const failed: string[] = [];

  for (let number of parcel_numbers) {
    const parcel = await getParcelByNumber(number);

    if (!parcel) {
      failed.push(number);
      continue;
    }

    const parcelHistory = await parcelHistoryRepository.find({
      where: { parcel_id: parcel.id },
    });

    if (!parcelHistory.length) {
      failed.push(number);
      continue;
    }

    const location = await locationRepository.findOne({
      where: { id: location_id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        geo_location: true,
      },
      relations: { city: { state: { country: true } } },
    });

    if (!location) {
      throw new CustomError('Location Not Found!', 404);
    }

    // const lastParcelHistory = parcelHistory[parcelHistory.length - 1];

    // if (lastParcelHistory.status === "in") {
    //   throw new CustomError('Unable to add in inventory as parcel status is already in!', 404);
    // }

    const parcelHistoryData = {
      name: location.name,
      city: location.city.name,
      description: location.description,
      address: location.address,
      geo_location: location.geo_location,
      status: 'in',
      from_location: location,
      parcel_id: parcel.id,
    };

    const newParcelHistory = parcelHistoryRepository.create(parcelHistoryData);
    await parcelHistoryRepository.save(newParcelHistory);

    success.push(number);
  }

  return { success, failed };
};

export const parcelOut = async (newData: TParcelsOut): Promise<{ success: string[]; failed: string[] }> => {
  const { parcel_numbers } = newData;
  const success: string[] = [];
  const failed: string[] = [];

  for (let number of parcel_numbers) {
    const parcel = await getParcelByNumber(number);

    if (!parcel) {
      failed.push(number);
      continue;
    }

    const parcelHistory = await parcelHistoryRepository.find({
      where: { parcel_id: parcel.id },
    });

    if (!parcelHistory.length) {
      failed.push(number);
      continue;
    }

    const from_location = await locationRepository.findOne({
      where: { id: newData.from_location_id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        geo_location: true,
      },
      relations: { city: { state: { country: true } } },
    });

    if (!from_location) {
      throw new CustomError('From Location Not Found!', 404);
    }

    const to_location = await locationRepository.findOne({
      where: { id: newData.to_location_id },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        geo_location: true,
      },
      relations: { city: { state: { country: true } } },
    });

    if (!to_location) {
      throw new CustomError('To Location Not Found!', 404);
    }

    const vehicle = await vehicleRepository.findOne({
      where: { id: newData.vehicle_id },
      select: {
        id: true,
        name: true,
        model: true,
        registration_number: true,
        status: true,
        driver: {
          name: true,
          email: true,
          phone_number: true,
          address: true,
          geo_location: true,
        },
      },
      relations: { driver: true, vehicle_type: true },
    });

    if (!vehicle) {
      throw new CustomError('Vehicle Not Found!', 404);
    }

    // const lastParcelHistory = parcelHistory[parcelHistory.length - 1];

    // if (lastParcelHistory.status === 'out') {
    //   throw new CustomError('Unable to out from inventory as parcel status is already out!', 404);
    // }

    const parcelHistoryData = {
      name: from_location.name,
      city: from_location.city.name,
      description: from_location.description,
      address: from_location.address,
      geo_location: from_location.geo_location,
      status: 'out',
      from_location: from_location,
      to_location: to_location,
      vehicle: vehicle,
      parcel_id: parcel.id,
    };

    const newParcelHistory = parcelHistoryRepository.create(parcelHistoryData);
    await parcelHistoryRepository.save(newParcelHistory);

    success.push(number);
  }

  return { success, failed };
};
