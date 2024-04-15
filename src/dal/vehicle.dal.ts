import { User, Vehicle } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateVehicle, TUpdateVehicle } from '../schemas/vehicle.schema';
import { In } from 'typeorm';
import { generateTrackingNumber } from '../utils/generateTrackingNumber';

const vehicleRepository = AppDataSource.getRepository(Vehicle);
const userRepository = AppDataSource.getRepository(User);

export const createVehicle = async (vehicleData: TCreateVehicle): Promise<Vehicle> => {
  const driver = await userRepository.findOne({
    where: {
      id: vehicleData.driver_id,
      user_role: {
        name: "driver"
      }
    }
  });

  if (!driver) {
    throw new CustomError('Driver Not Found!', 404);
  }

  vehicleData.tracking_number = generateTrackingNumber();

  const newVehicle = vehicleRepository.create(vehicleData);
  return await vehicleRepository.save(newVehicle);
};

export const getAllVehicles = async (): Promise<Vehicle[] | null> => {
  const vehicles = await vehicleRepository.find({
    relations: {
      driver: true,
      vehicle_type: true,
    },
  });
  return vehicles;
};

export const getVehicleById = async (id: string): Promise<Vehicle | undefined> => {
  const vehicle = await vehicleRepository.findOne({
    where: { id },
    relations: {
      driver: true,
      vehicle_type: true,
    },
  });

  if (!vehicle) {
    throw new CustomError('Vehicle Not Found!', 404);
  }

  return vehicle;
};

export const getVehicleByIds = async (ids: string[]): Promise<Vehicle[]> => {
  const vehicles = await vehicleRepository.find({ where: { id: In(ids) } });

  return vehicles;
};

export const updateVehicle = async (id: string, newData: TUpdateVehicle): Promise<Vehicle | null> => {
  const vehicleToUpdate = await vehicleRepository.findOne({
    where: { id },
  });

  if (!vehicleToUpdate) {
    throw new CustomError('Vehicle Not Found!', 404);
  }

  const updatedVehicle = { ...vehicleToUpdate, ...newData };
  return await vehicleRepository.save(updatedVehicle);
};

export const deleteVehicle = async (id: string): Promise<boolean> => {
  const result = await vehicleRepository.softDelete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Vehicle Not Found!', 404);
  }

  return isDeleted;
};
