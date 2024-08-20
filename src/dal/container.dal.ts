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

export const addItemsToContainer = async (id: string, order_numbers: string[]): Promise<Container> => {
  const container = await getContainerById(id);
  const addOrders: string[] = [];
  const failedOrders: string[] = [];

  for (let number of order_numbers) {
    const order = await getOrderByNumber(number);

    if (!order || !order.pricing) {
      failedOrders.push(number);
      continue;
    }

    const orderHistory = await orderHistoryRepository.find({
      where: { order_id: order.id },
    });

    if (!orderHistory.length) {
      failedOrders.push(number);
      continue;
    }

    const orderPricing = order.pricing as Pricing;

    console.log({ orderPackage: orderPricing.package });
  }

  // console.log({ orderItems });
  // await containerRepository.update(id, { orderHistory:  })

  return container;
};

export const getAllContainers = async (): Promise<Container[] | null> => {
  const containers = await containerRepository.find();
  return containers;
};

export const getContainerById = async (id: string): Promise<Container> => {
  const container = await containerRepository.findOne({
    where: { id },
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
