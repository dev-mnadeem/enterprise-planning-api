import { Location, OrderHistory, Vehicle } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TOrderIn, TOrderOut } from '../schemas/orderHistory.schema';

const orderHistoryRepository = AppDataSource.getRepository(OrderHistory);
const locationRepository = AppDataSource.getRepository(Location);
const vehicleRepository = AppDataSource.getRepository(Vehicle);

export const orderIn = async (id: string, newData: TOrderIn): Promise<OrderHistory | null> => {
  const orderHistory = await orderHistoryRepository.find({
    where: { order_id: id },
  });

  if (!orderHistory.length) {
    throw new CustomError('Order History Not Exists!', 404);
  }

  const location = await locationRepository.findOne({
    where: { id: newData.location_id },
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

  const lastOrderHistory = orderHistory[orderHistory.length - 1];

  if (lastOrderHistory.status === "in") {
    throw new CustomError('Unable to add in inventory as order status is already in!', 404);
  }

  const orderHistoryData = {
    name: location.name,
    city: location.city.name,
    description: location.description,
    address: location.address,
    geo_location: location.geo_location,
    status: 'in',
    from_location: location,
    order_id: id,
  };

  const newOrderHistory = orderHistoryRepository.create(orderHistoryData);
  return await orderHistoryRepository.save(newOrderHistory);
};

export const orderOut = async (id: string, newData: TOrderOut): Promise<OrderHistory | null> => {
  const orderHistory = await orderHistoryRepository.find({
    where: { order_id: id },
  });

  if (!orderHistory.length) {
    throw new CustomError('Order History Not Exists!', 404);
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
      }
    },
    relations: { driver: true, vehicle_type: true },
  });


  if (!vehicle) {
    throw new CustomError('Vehicle Not Found!', 404);
  }

  const lastOrderHistory = orderHistory[orderHistory.length - 1];

  if (lastOrderHistory.status === "out") {
    throw new CustomError('Unable to out from inventory as order status is already out!', 404);
  }

  const orderHistoryData = {
    name: from_location.name,
    city: from_location.city.name,
    description: from_location.description,
    address: from_location.address,
    geo_location: from_location.geo_location,
    status: 'out',
    from_location: from_location,
    to_location: to_location,
    vehicle: vehicle,
    order_id: id,
  };

  const newOrderHistory = orderHistoryRepository.create(orderHistoryData);
  return await orderHistoryRepository.save(newOrderHistory);
};
