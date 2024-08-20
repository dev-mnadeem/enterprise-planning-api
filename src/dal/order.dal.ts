import { Location, Order, OrderHistory, OrderItem, Package, Pricing, User } from '../entities';
import { AppDataSource } from '../database/data-source';
import * as userService from './user.dal';
import * as userRoleService from './userRole.dal';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';
import { CustomError } from '../utils/customError';
import { hashPassword } from '../utils/passwordUtils';
import { generateOrderNumber } from '../utils/generateOrderNumber';
import { getCityById } from './city.dal';
import { getPackageById } from './package.dal';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { OrderQueryParams } from '../types/order.interface';
import { addSearchToQuery } from '../utils/searchUtils';
import { buildPagination } from '../utils/paginationUtils';
import { PageInfoResponse } from '../types/pagination.interface';

const orderRepository = AppDataSource.getRepository(Order);
const orderHistoryRepository = AppDataSource.getRepository(OrderHistory);

export const createOrder = async (user_id: string, orderData: TCreateOrder): Promise<Order | undefined> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Destructure orderData to separate orderItems from the main order details
    const { orderItems, pricing, location_id, package_id, ...orderDetails } = orderData;

    if (orderDetails.sender_id) {
      await userService.getUserById(orderDetails.sender_id);
    } else {
      const {
        sender_name: name,
        sender_address: address,
        sender_city_id: city_id,
        sender_email,
        sender_phone,
      } = orderDetails;

      const email = sender_email?.toLocaleLowerCase();
      const phone_number = sender_phone.trim().replaceAll(' ', '');

      let sender = await userService.getUserByPhone(phone_number);

      if (!sender) {
        const customerUserRole = await userRoleService.getUserRoleByName('customer');
        const encryptedPassword = await hashPassword('Helloworld');

        // Create the receiver entity
        const newSender = queryRunner.manager.create(User, {
          email: email,
          city_id,
          phone_number: phone_number,
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
        receiver_phone,
        receiver_email,
      } = orderDetails;

      const email = receiver_email?.toLocaleLowerCase();
      const phone_number = receiver_phone.trim().replaceAll(' ', '');

      let receiver = await userService.getUserByPhone(phone_number);

      if (!receiver) {
        const customerUserRole = await userRoleService.getUserRoleByName('customer');
        const encryptedPassword = await hashPassword('Helloworld');

        // Create the receiver entity
        const newReceiver = queryRunner.manager.create(User, {
          email: email,
          city_id,
          phone_number: phone_number,
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
          weight_type: true,
          route: true,
        },
      });

      if (!pkg) {
        throw new CustomError('Package Not Found!', 404);
      }
      orderPackage = pkg;
    }

    let newPricing = {};

    if (pricing) {
      const exitingPricing = await queryRunner.manager.findOne(Pricing, {
        where: { from_city_id: pricing.from_city_id, to_city_id: pricing.to_city_id, package_id: pricing.package_id },
        select: {
          id: true,
          route: true,
          price: true,
        },
        relations: {
          from_city: true,
          to_city: true,
          package: true,
        },
      });

      if (exitingPricing) {
        newPricing = exitingPricing;
      } else {
        const from_city = await getCityById(pricing.from_city_id);
        const to_city = await getCityById(pricing.to_city_id);
        const pkg = pricing.package_id ? await getPackageById(pricing.package_id) : undefined;

        const createdPricing = queryRunner.manager.create(Pricing, {
          from_city,
          to_city,
          package: pkg,
          price: pricing.price,
          route: pricing.route,
        });
        newPricing = await queryRunner.manager.save(Pricing, createdPricing);
      }
    }

    const order_number = generateOrderNumber();
    // Create the main order entity
    const newOrder = queryRunner.manager.create(Order, {
      ...orderDetails,
      user_id,
      order_number,
      package: orderPackage,
      pricing: newPricing,
    });
    const savedOrder = await queryRunner.manager.save(Order, newOrder);

    // Create order items
    const newOrderItems = orderItems.map((item) => {
      return queryRunner.manager.create(OrderItem, {
        ...item,
        total_price: item.quantity * (item?.price ? item.price : 0),
        order_id: savedOrder.id,
      });
    });

    // Save order items
    await queryRunner.manager.save(OrderItem, newOrderItems);

    // Assign saved order items to the order
    savedOrder.order_items = newOrderItems;

    if (location_id) {
      const location = await queryRunner.manager.findOne(Location, {
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

      console.log({ location });

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
        status: 'in',
        from_location: location,
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

    return await getOrderById(savedOrder.id);
  } catch (err) {
    // Rollback the transaction on error
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
};

export const validateOrderNumber = async (
  order_number: string,
  status: string,
): Promise<{ is_valid: Boolean; message?: string }> => {
  const order = await orderRepository.findOne({
    where: { order_number },
  });

  if (!order) {
    return { is_valid: false, message: 'Given shipment number is not valid!' };
  }

  const lastOrderHistory = await orderHistoryRepository.findOne({
    where: { order_id: order.id },
    order: {
      created_at: 'DESC',
    },
  });

  if (!lastOrderHistory) {
    return { is_valid: false, message: 'Given shipment number is not valid!' };
  }

  if (lastOrderHistory.status === status) {
    return {
      is_valid: false,
      message:
        lastOrderHistory.status === 'in'
          ? 'Unable to add in inventory as order status is already in!'
          : 'Unable to out from inventory as order status is already out!',
    };
  }

  return { is_valid: true };
};

export const getAllOrders = async (
  currentUser: User,
  params: OrderQueryParams,
): Promise<{ pageInfo: PageInfoResponse; results: Order[] | null }> => {
  const { search, pageNumber, pageSize, sortBy, orderBy, locationId } = params;
  const { locations } = currentUser;
  const locationIds = locations.map((location) => location.id);
  const query = await orderRepository
    .createQueryBuilder('order')
    .leftJoin('order.user', 'user')
    .leftJoin('order.history', 'history')
    .leftJoin('order.order_items', 'order_items')
    .leftJoin('order.sender_city', 'sender_city')
    .leftJoin('sender_city.state', 'sender_state')
    .leftJoin('sender_state.country', 'sender_country')
    .leftJoin('order.receiver_city', 'receiver_city')
    .leftJoin('receiver_city.state', 'receiver_state')
    .leftJoin('receiver_state.country', 'receiver_country')
    .select([
      'order.id',
      'order.order_number',
      'order.sender_name',
      'order.sender_phone',
      'order.receiver_name',
      'order.receiver_phone',
    ])
    .addSelect(['sender_city.name', 'sender_state.name', 'sender_country.name'])
    .addSelect(['receiver_city.name', 'receiver_state.name', 'receiver_country.name'])
    .addSelect([
      'history.name',
      'history.city',
      'history.status',
      // 'history.from_location',
      // 'history.to_location',
      'history.created_at',
    ])
    .where('order.deleted_at IS NULL');

  // Subquery to get the latest history entry for each order
  const subQuery = `SELECT "history"."order_id", MAX("history"."created_at") AS "max_created_at"
                    FROM "order_history" "history"
                    GROUP BY "history"."order_id"`;

  if (locationId) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          `history.created_at IN (
            SELECT "max_created_at"
            FROM (${subQuery}) AS "latest"
            WHERE "latest"."order_id" = "order"."id"
          )`,
        ).andWhere(
          new Brackets((innerQb) => {
            innerQb
              .where("history.from_location->>'id' = :locationId", { locationId })
              .orWhere("history.to_location->>'id' = :locationId", { locationId });
          }),
        );
      }),
    );
  } else {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          `history.created_at IN (
            SELECT "max_created_at"
            FROM (${subQuery}) AS "latest"
            WHERE "latest"."order_id" = "order"."id"
          )`,
        ).andWhere(
          new Brackets((innerQb) => {
            innerQb
              .where("history.from_location->>'id' IN (:...locationIds)", { locationIds })
              .orWhere("history.to_location->>'id' IN (:...locationIds)", { locationIds });
          }),
        );
      }),
    );
  }

  if (sortBy && Object.keys(orderRepository.metadata.propertiesMap).includes(sortBy)) {
    query.orderBy(`user.${sortBy}`, orderBy || 'DESC');
  }

  if (search) {
    addSearchToQuery(query, `order.order_number`, search);
  }

  const { take, skip, pageNo } = buildPagination(pageNumber, pageSize);
  // const orderList = await query.take(take).skip(skip).getMany();
  const orderList = await query.getMany();

  const total = await query.getCount();
  const totalPages = Math.ceil(total / take);

  return {
    pageInfo: {
      pageNumber: pageNo,
      pageSize: take,
      totalPages,
      totalResults: total,
    },
    results: orderList,
  };
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  const order = await orderRepository.findOne({
    where: { id },
    relations: {
      user: true,
      history: true,
      order_items: true,
      sender_city: { state: { country: true } },
      receiver_city: { state: { country: true } },
    },
    order: {
      history: {
        created_at: 'DESC',
      },
    },
  });

  if (!order) {
    throw new CustomError('Order Not Found!', 404);
  }

  return order;
};

export const getOrderByNumber = async (number: string): Promise<Order | null> => {
  const order = await orderRepository.findOne({
    where: { order_number: number },
    relations: {
      user: true,
      history: true,
      order_items: true,
      sender_city: { state: { country: true } },
      receiver_city: { state: { country: true } },
    },
  });

  return order;
};

export const updateOrder = async (user_id: string, id: string, newData: TUpdateOrder): Promise<Order | undefined> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const orderRepository = queryRunner.manager.getRepository(Order);
    const orderItemRepository = queryRunner.manager.getRepository(OrderItem);

    const orderToUpdate = await orderRepository.findOne({
      where: { id },
      relations: ['order_items', 'history'],
    });

    if (!orderToUpdate) {
      throw new CustomError('Order Not Found!', 404);
    }

    const { orderItems, pricing, location_id, package_id, ...orderDetails } = newData;

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
          weight_type: true,
          route: true,
        },
      });

      if (!pkg) {
        throw new CustomError('Package Not Found!', 404);
      }
      orderPackage = pkg;
    }

    let newPricing = {};

    if (pricing) {
      const exitingPricing = await queryRunner.manager.findOne(Pricing, {
        where: { from_city_id: pricing.from_city_id, to_city_id: pricing.to_city_id, package_id: pricing.package_id },
        select: {
          id: true,
          price: true,
        },
        relations: {
          from_city: true,
          to_city: true,
          package: true,
        },
      });

      if (exitingPricing) {
        newPricing = exitingPricing;
      } else {
        const from_city = await getCityById(pricing.from_city_id);
        const to_city = await getCityById(pricing.to_city_id);
        const pkg = pricing.package_id ? await getPackageById(pricing.package_id) : undefined;

        const createdPricing = queryRunner.manager.create(Pricing, {
          from_city,
          to_city,
          package: pkg,
          price: pricing.price,
        });
        newPricing = await queryRunner.manager.save(Pricing, createdPricing);
      }
    }

    // Update order details
    const updatedOrder = orderRepository.merge(orderToUpdate, {
      ...orderDetails,
      user_id,
      package: orderPackage,
      pricing: newPricing,
    });
    await queryRunner.manager.save(Order, updatedOrder);

    if (orderItems) {
      // Update order items
      const existingOrderItemIds = orderToUpdate.order_items.map((item) => item.id);
      const newOrderItemIds = orderItems.map((item) => item.id).filter((id) => id !== undefined);

      // Find items to remove
      const itemsToRemove = existingOrderItemIds.filter((id) => !newOrderItemIds.includes(id));

      // Remove old items that are not in the new items
      await queryRunner.manager.delete(OrderItem, itemsToRemove);

      // Update or add new items
      const newOrderItems = orderItems.map((item) => {
        return orderItemRepository.create({
          ...item,
          total_price: item.quantity * (item?.price ? item.price : 0),
          order_id: updatedOrder.id,
        });
      });

      await queryRunner.manager.save(OrderItem, newOrderItems);

      // Update the order's orderItems
      updatedOrder.order_items = newOrderItems;
    }

    if (location_id) {
      const location = await queryRunner.manager.findOne(Location, {
        where: { id: location_id },
        select: {
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

      const {
        name,
        city: { name: city },
        description,
        address,
        geo_location,
      } = location;

      const orderHistory = await queryRunner.manager.findOne(OrderHistory, {
        where: { name, address, geo_location, order_id: updatedOrder.id },
      });

      if (!orderHistory) {
        const orderHistoryData = {
          name,
          city,
          description,
          address,
          geo_location,
          status: 'in',
          from_location: location,
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

    return await getOrderById(updatedOrder.id);
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
