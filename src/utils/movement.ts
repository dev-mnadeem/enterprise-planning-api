import { EntityManager } from 'typeorm';

import { Container, Location, Vehicle } from '../entities';
import { CustomError } from './customError';

export type MovementStatus = 'in' | 'out';

export interface MovementResult {
  success: string[];
  failed: string[];
}

/**
 * A shipment can only move to the opposite of where its last history entry
 * left it: something checked in can go out, and vice versa. A missing
 * history means the shipment was never received and cannot move at all.
 */
export const canMove = (lastStatus: string | undefined, target: MovementStatus): boolean =>
  lastStatus !== undefined && lastStatus !== target;

export const findLocationSnapshot = async (
  manager: EntityManager,
  locationId: string,
  label = 'Location',
): Promise<Location> => {
  const location = await manager.findOne(Location, {
    where: { id: locationId },
    select: { id: true, name: true, description: true, address: true, geo_location: true },
    relations: { city: { state: { country: true } } },
  });

  if (!location) {
    throw new CustomError(`${label} Not Found!`, 404);
  }
  return location;
};

export const findVehicleSnapshot = async (manager: EntityManager, vehicleId: string): Promise<Vehicle> => {
  const vehicle = await manager.findOne(Vehicle, {
    where: { id: vehicleId },
    select: {
      id: true,
      name: true,
      model: true,
      registration_number: true,
      status: true,
      driver: { name: true, email: true, phone_number: true, address: true, geo_location: true },
    },
    relations: { driver: true, vehicle_type: true },
  });

  if (!vehicle) {
    throw new CustomError('Vehicle Not Found!', 404);
  }
  return vehicle;
};

export const findContainerSnapshot = async (manager: EntityManager, containerId: string): Promise<Container> => {
  const container = await manager.findOne(Container, {
    where: { id: containerId },
    select: {
      id: true,
      tracking_number: true,
      universal_number: true,
      width: true,
      height: true,
      depth: true,
      volume: true,
      volume_unit: true,
    },
    relations: { from_country: true, to_country: true },
  });

  if (!container) {
    throw new CustomError('Container Not Found!', 404);
  }
  return container;
};

/** The flat columns every history row repeats from its location. */
export const historyFields = (location: Location) => ({
  name: location.name,
  city: location.city.name,
  description: location.description,
  address: location.address,
  geo_location: location.geo_location,
});
