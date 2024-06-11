import { Location, Order, OrderHistory, OrderItem, Package, User } from '../entities';
import { AppDataSource } from '../database/data-source';
import * as userService from './user.dal';
import * as userRoleService from './userRole.dal';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';
import { CustomError } from '../utils/customError';
import { hashPassword } from '../utils/passwordUtils';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { getLocationById } from './location.dal';

const orderRepository = AppDataSource.getRepository(Order);

export const createOrder = async (user_id: string, orderData: TCreateOrder): Promise<Order> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Destructure orderData to separate orderItems from the main order details
    const { orderItems, location_id, package_id, ...orderDetails } = orderData;

    if (orderDetails.sender_id) {
      await userService.getUserById(orderDetails.sender_id);
    } else {
      const {
        sender_name: name,
        sender_address: address,
        sender_city_id: city_id,
        sender_phone: phone_number,
        sender_email: email,
      } = orderDetails;

      let sender = await userService.getUserByPhone(phone_number);

      if (!sender) {
        const customerUserRole = await userRoleService.getUserRoleByName('customer');
        const encryptedPassword = await hashPassword('Helloworld');

        // Create the receiver entity
        const newSender = queryRunner.manager.create(User, {
          email,
          city_id,
          phone_number,
          name,
          address,
          password: encryptedPassword,
          role_id: customerUserRole.id,
        });
        sender = await queryRunner.manager.save(User, newSender);
      }

      orderDetails.sender_id = sender.id;
    }

    if (orderDetails.receiver_id) {
      await userService.getUserById(orderDetails.receiver_id);
    } else {
      const {
        receiver_name: name,
        receiver_address: address,
        receiver_city_id: city_id,
        receiver_phone: phone_number,
        receiver_email: email,
      } = orderDetails;

      let receiver = await userService.getUserByPhone(phone_number);

      if (!receiver) {
        const customerUserRole = await userRoleService.getUserRoleByName('customer');
        const encryptedPassword = await hashPassword('Helloworld');

        // Create the receiver entity
        const newReceiver = queryRunner.manager.create(User, {
          email,
          city_id,
          phone_number,
          name,
          address,
          password: encryptedPassword,
          role_id: customerUserRole.id,
        });
        receiver = await queryRunner.manager.save(User, newReceiver);
      }

      orderDetails.receiver_id = receiver.id;
    }

    let orderPackage: Partial<Package> | undefined = undefined;

    if (package_id) {
      const pkg = await queryRunner.manager.findOne(Package, {
          where: { id: package_id },
          select: {
            name: true,
            width: true,
            height: true,
            depth: true,
            weight_limit: true,
            price: true,
          },
        });

        if (!pkg) {
          throw new CustomError('Package Not Found!', 404);
        } 
        orderPackage = pkg;
    }

    const order_number = generateOrderNumber();
    // Create the main order entity
    const newOrder = queryRunner.manager.create(Order, {
      ...orderDetails,
      user_id,
      order_number,
      package: orderPackage,
    });
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

    if (location_id) {
      const location = await queryRunner.manager.findOne(Location, {
        where: { id: location_id },
        relations: { city: true },
      });

      if (!location) {
        throw new CustomError('Location Not Found!', 404);
      }

      const {
        name,
        city: { name: city },
        description,
        address,
        geo_location,
      } = location;

      const orderHistoryData = {
        name,
        city,
        description,
        address,
        geo_location,
        status: savedOrder.status,
        order_id: savedOrder.id,
      };
      // Create order history
      const newOrderHistory = queryRunner.manager.create(OrderHistory, orderHistoryData);

      //Save order history
      await queryRunner.manager.save(OrderHistory, newOrderHistory);

      // Assign saved order history to the order
      savedOrder.history = [newOrderHistory];
    }

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
  const orders = await orderRepository.find({
    where: { deleted_at: undefined },
    relations: { user: true, history: true, sender_city: { state: { country: true } }, receiver_city: { state: { country: true } } },
  });
  return orders;
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: { user: true, history: true, sender_city: { state: { country: true } }, receiver_city: { state: { country: true } } },
  });

  if (!order) {
    throw new CustomError('Order Not Found!', 404);
  }

  return order;
};

export const updateOrder = async (user_id: string, id: string, newData: TUpdateOrder): Promise<Order | null> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const orderRepository = queryRunner.manager.getRepository(Order);
    const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

    const orderToUpdate = await orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'history'],
    });

    if (!orderToUpdate) {
      throw new CustomError('Order Not Found!', 404);
    }

    const { orderItems, location_id, package_id, ...orderDetails } = newData;

    let orderPackage: Partial<Package> | undefined = undefined;

    if (package_id) {
      const pkg = await queryRunner.manager.findOne(Package, {
          where: { id: package_id },
          select: {
            name: true,
            width: true,
            height: true,
            depth: true,
            weight_limit: true,
            price: true,
          },
        });

        if (!pkg) {
          throw new CustomError('Package Not Found!', 404);
        } 
        orderPackage = pkg;
    }

    // Update order details
    const updatedOrder = orderRepository.merge(orderToUpdate, { ...orderDetails, user_id, package: orderPackage });
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

    if (location_id) {
      const location = await queryRunner.manager.findOne(Location, {
        where: { id: location_id },
        relations: { city: true },
      });

      if (!location) {
        throw new CustomError('Location Not Found!', 404);
      }

      const {
        name,
        city: { name: city },
        description,
        address,
        geo_location,
      } = location;

      const orderHistory = await queryRunner.manager.findOne(OrderHistory, {
        where: { name, address, geo_location, order_id: updatedOrder.id }
      });

      if (!orderHistory) {
        const orderHistoryData = {
          name,
          city,
          description,
          address,
          geo_location,
          status: updatedOrder.status,
          order_id: updatedOrder.id,
        };
        // Create order history
        const newOrderHistory = queryRunner.manager.create(OrderHistory, orderHistoryData);
  
        //Save order history
        await queryRunner.manager.save(OrderHistory, newOrderHistory);
  
        // Assign saved order history to the order
        updatedOrder.history = [...updatedOrder.history, newOrderHistory];
      }
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
  const result = await orderRepository.softDelete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Order Not Found!', 404);
  }

  return isDeleted;
};
