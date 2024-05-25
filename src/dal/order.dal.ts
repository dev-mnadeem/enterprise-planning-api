import { Order, OrderItem } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';
import { CustomError } from '../utils/customError';

const orderRepository = AppDataSource.getRepository(Order);

export const createOrder = async (orderData: TCreateOrder): Promise<Order> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Destructure orderData to separate orderItems from the main order details
    const { orderItems, ...orderDetails } = orderData;

    // Create the main order entity
    const newOrder = queryRunner.manager.create(Order, orderDetails);
    const savedOrder = await queryRunner.manager.save(Order, newOrder);

    // Create order items
    const newOrderItems = orderItems.map((item) => {
      return queryRunner.manager.create(OrderItem, {
        ...item,
        order_id: savedOrder.id,
      });
    });

    // Save order items
    await queryRunner.manager.save(OrderItem, newOrderItems);

    // Assign saved order items to the order
    savedOrder.orderItems = newOrderItems;

    // Commit the transaction
    await queryRunner.commitTransaction();

    return savedOrder;
  } catch (err) {
    // Rollback the transaction on error
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
};

export const getAllOrders = async (): Promise<Order[] | null> => {
  const orders = await orderRepository.find();
  return orders;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const order = await orderRepository.findOne({ where: { id } });

  if (!order) {
    throw new CustomError('Order Not Found!', 404);
  }

  return order;
};

export const updateOrder = async (id: string, newData: TUpdateOrder): Promise<Order | null> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const orderRepository = queryRunner.manager.getRepository(Order);
    const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

    const orderToUpdate = await orderRepository.findOne({
      where: { id },
      relations: ['orderItems'],
    });

    if (!orderToUpdate) {
      throw new CustomError('Order Not Found!', 404);
    }

    const { orderItems, ...orderDetails } = newData;

    // Update order details
    const updatedOrder = orderRepository.merge(orderToUpdate, orderDetails);
    await queryRunner.manager.save(Order, updatedOrder);

    if (orderItems) {
      // Update order items
      const existingOrderItemIds = orderToUpdate.orderItems.map((item) => item.id);
      const newOrderItemIds = orderItems.map((item) => item.id).filter((id) => id !== undefined);

      // Find items to remove
      const itemsToRemove = existingOrderItemIds.filter((id) => !newOrderItemIds.includes(id));

      // Remove old items that are not in the new items
      await queryRunner.manager.delete(OrderItem, itemsToRemove);

      // Update or add new items
      const newOrderItems = orderItems.map((item) => {
        return orderItemRepository.create({
          ...item,
          order_id: updatedOrder.id,
        });
      });

      await queryRunner.manager.save(OrderItem, newOrderItems);

      // Update the order's orderItems
      updatedOrder.orderItems = newOrderItems;
    }

    // Commit the transaction
    await queryRunner.commitTransaction();

    return updatedOrder;
  } catch (err) {
    // Rollback the transaction on error
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const result = await orderRepository.delete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Order Not Found!', 404);
  }

  return isDeleted;
};
