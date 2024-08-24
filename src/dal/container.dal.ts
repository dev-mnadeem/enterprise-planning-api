import { Container, OrderHistory, Pricing } from '../entities';
import { AppDataSource } from '../database/data-source';
import { CustomError } from '../utils/customError';
import { TCreateContainer, TUpdateContainer } from '../schemas/container.schema';
import { In } from 'typeorm';
import { generateTrackingNumber } from '../utils/generateTrackingNumber';
import { getOrderByNumber } from './order.dal';

const containerRepository = AppDataSource.getRepository(Container);
const orderHistoryRepository = AppDataSource.getRepository(OrderHistory);

export const createContainer = async (containerData: TCreateContainer): Promise<Container> => {
  containerData.tracking_number = generateTrackingNumber();

  const newContainer = containerRepository.create(containerData);
  return await containerRepository.save(newContainer);
};

export const getAllContainers = async (): Promise<Container[] | null> => {
  const containers = await containerRepository.find({
    relations: {
      from_country: true,
      to_country: true,
    },
  });
  return containers;
};

export const getContainerById = async (id: string): Promise<Container> => {
  const container = await containerRepository.findOne({
    where: { id },
    relations: {
      from_country: true,
      to_country: true,
    },
  });

  if (!container) {
    throw new CustomError('Container Not Found!', 404);
  }

  return container;
};

export const updateContainer = async (id: string, newData: TUpdateContainer): Promise<Container | null> => {
  const containerToUpdate = await containerRepository.findOne({
    where: { id },
  });

  if (!containerToUpdate) {
    throw new CustomError('Container Not Found!', 404);
  }

  const updatedContainer = { ...containerToUpdate, ...newData };
  return await containerRepository.save(updatedContainer);
};

export const deleteContainer = async (id: string): Promise<boolean> => {
  const result = await containerRepository.softDelete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Container Not Found!', 404);
  }

  return isDeleted;
};
