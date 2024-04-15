import { VehicleType } from '../entities';
import { AppDataSource } from '../database/data-source';

const vehicleTypeRepository = AppDataSource.getRepository(VehicleType);

export const getAllVehicleTypes = async (): Promise<VehicleType[] | null> => {
  const vehicleTypes = await vehicleTypeRepository.find();
  return vehicleTypes;
};
