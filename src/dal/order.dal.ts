import { randomBytes } from 'crypto';
import { EntityManager } from 'typeorm';

import { Location, Order, OrderHistory, OrderItem, Package, Pricing, User } from '../entities';
import { AppDataSource } from '../database/data-source';
import * as userService from './user.dal';
import * as userRoleService from './userRole.dal';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';
import { TCreatePricing } from '../schemas/pricing.schema';
import { CustomError } from '../utils/customError';
import { hashPassword } from '../utils/passwordUtils';
import { generateShipmentNumber } from '../utils/shipmentNumber';
import { getCityById } from './city.dal';
import { getPackageById } from './package.dal';
import { OrderQueryParams } from '../types/order.interface';
import { addSearchToQuery } from '../utils/searchUtils';
import { buildPagination } from '../utils/paginationUtils';
import { resolveLocationScope, whereLatestHistoryIn } from '../utils/locationScope';
import { PageInfoResponse } from '../types/pagination.interface';
import { findLocationSnapshot, historyFields } from '../utils/movement';

const orderRepository = AppDataSource.getRepository(Order);
const orderHistoryRepository = AppDataSource.getRepository(OrderHistory);

type OrderParty = { name: string; phone: string; email?: string; address: string; city_id: string };

/**
 * Senders and receivers are matched on phone number and created as customers
 * when unknown. They get a random password: these accounts exist to own
 * orders, and the shared default the code used before let anyone who knew a
 * customer's phone number sign in as them.
 */
const findOrCreateCustomer = async (manager: EntityManager, party: OrderParty): Promise<User> => {
  const phone_number = party.phone.trim().replaceAll(' ', '');
  const existing = await userService.getUserByPhone(phone_number);
  if (existing) return existing;

  const customerRole = await userRoleService.getUserRoleByName('customer');
  return manager.save(
    User,
    manager.create(User, {
      name: party.name,
      email: party.email?.toLowerCase(),
      phone_number,
      address: party.address,
      city_id: party.city_id,
      password: await hashPassword(randomBytes(24).toString('base64url')),
      role_id: customerRole.id,
    }),
  );
};

const findPackageSnapshot = async (manager: EntityManager, packageId: string): Promise<Partial<Package>> => {
  const pkg = await manager.findOne(Package, {
    where: { id: packageId },
    select: { name: true, width: true, height: true, depth: true, weight_limit: true, weight_type: true, route: true },
  });

  if (!pkg) {
    throw new CustomError('Package Not Found!', 404);
  }
  return pkg;
};

/** Reuses the price list entry for this lane, or records a one-off price. */
const resolvePricing = async (manager: EntityManager, pricing: TCreatePricing): Promise<Partial<Pricing>> => {
  const route = pricing.route ?? 'road';
  const existing = await manager.findOne(Pricing, {
    where: {
      from_city_id: pricing.from_city_id,
      to_city_id: pricing.to_city_id,
      package_id: pricing.package_id,
      route,
    },
    select: { id: true, route: true, price: true },
    relations: { from_city: true, to_city: true, package: true },
  });
  if (existing) return existing;

  return manager.save(
    Pricing,
    manager.create(Pricing, {
      from_city: await getCityById(pricing.from_city_id),
      to_city: await getCityById(pricing.to_city_id),
      package: await getPackageById(pricing.package_id),
      price: pricing.price,
      route,
    }),
  );
};

const checkInHistory = (orderId: string, location: Location): Partial<OrderHistory> => ({
  ...historyFields(location),
  status: 'in',
  from_location: location,
  order_id: orderId,
});

const lineTotal = (item: { quantity: number; price?: number }) => item.quantity * (item.price ?? 0);

export const createOrder = async (user_id: string, orderData: TCreateOrder): Promise<Order | undefined> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;
    const { orderItems, pricing, location_id, package_id, ...orderDetails } = orderData;

    if (orderDetails.sender_id) {
      await userService.getUserById(orderDetails.sender_id);
    } else {
      const sender = await findOrCreateCustomer(manager, {
        name: orderDetails.sender_name,
        phone: orderDetails.sender_phone,
        email: orderDetails.sender_email,
        address: orderDetails.sender_address,
        city_id: orderDetails.sender_city_id,
      });
      orderDetails.sender_id = sender.id;
    }

    if (orderDetails.receiver_id) {
      await userService.getUserById(orderDetails.receiver_id);
    } else {
      const receiver = await findOrCreateCustomer(manager, {
        name: orderDetails.receiver_name,
        phone: orderDetails.receiver_phone,
        email: orderDetails.receiver_email,
        address: orderDetails.receiver_address,
        city_id: orderDetails.receiver_city_id,
      });
      orderDetails.receiver_id = receiver.id;
    }

    const location = await findLocationSnapshot(manager, location_id);

    const savedOrder = await manager.save(
      Order,
      manager.create(Order, {
        ...orderDetails,
        location_id,
        user_id,
        order_number: generateShipmentNumber(),
        package: package_id ? await findPackageSnapshot(manager, package_id) : undefined,
        pricing: await resolvePricing(manager, pricing),
      }),
    );

    await manager.save(
      OrderItem,
      orderItems.map((item) =>
        manager.create(OrderItem, { ...item, total_price: lineTotal(item), order_id: savedOrder.id }),
      ),
    );

    await manager.save(OrderHistory, manager.create(OrderHistory, checkInHistory(savedOrder.id, location)));

    await queryRunner.commitTransaction();

    return await getOrderById(savedOrder.id);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
};

export const validateOrderNumber = async (
  order_number: string,
  status: string,
): Promise<{ is_valid: boolean; message?: string }> => {
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
  const scope = resolveLocationScope(currentUser, locationId);
  const { take, skip, pageNo } = buildPagination(pageNumber, pageSize);

  // A user with no assigned locations has nothing to list. Querying anyway
  // produced `IN ()`, a Postgres syntax error.
  if (scope.kind === 'locations' && !scope.ids.length) {
    return { pageInfo: { pageNumber: pageNo, pageSize: take, totalPages: 0, totalResults: 0 }, results: [] };
  }

  const query = orderRepository
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
      'order.created_at',
    ])
    .addSelect(['sender_city.name', 'sender_state.name', 'sender_country.name', 'sender_country.code'])
    .addSelect(['receiver_city.name', 'receiver_state.name', 'receiver_country.name', 'receiver_country.code'])
    .addSelect(['history.name', 'history.city', 'history.status', 'history.created_at'])
    .where('order.deleted_at IS NULL')
    .orderBy(`order.created_at`, 'DESC');

  whereLatestHistoryIn(query, { alias: 'order', historyTable: 'order_history', foreignKey: 'order_id' }, scope);

  if (sortBy && Object.keys(orderRepository.metadata.propertiesMap).includes(sortBy)) {
    query.orderBy(`order.${sortBy}`, orderBy || 'DESC');
  }

  if (search) {
    addSearchToQuery(query, `order.order_number`, search);
  }

  const orderList = await query.take(take).skip(skip).getMany();

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
      parcels: {
        parcel_items: {
          order_item: true,
        },
        history: true,
      },
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

export const updateOrder = async (id: string, newData: TUpdateOrder): Promise<Order | undefined> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const manager = queryRunner.manager;

    const orderToUpdate = await manager.findOne(Order, {
      where: { id },
      relations: { order_items: true, history: true },
    });

    if (!orderToUpdate) {
      throw new CustomError('Order Not Found!', 404);
    }

    const { orderItems, pricing, location_id, package_id, id: _id, ...orderDetails } = newData;

    // Package and pricing are snapshots taken at booking. They used to be
    // overwritten with undefined / {} by any PATCH that did not resend them.
    const updatedOrder = manager.merge(Order, orderToUpdate, {
      ...orderDetails,
      ...(location_id ? { location_id } : {}),
      ...(package_id ? { package: await findPackageSnapshot(manager, package_id) } : {}),
      ...(pricing ? { pricing: await resolvePricing(manager, pricing) } : {}),
    });
    await manager.save(Order, updatedOrder);

    if (orderItems) {
      const existingIds = orderToUpdate.order_items.map((item) => item.id);
      const foreign = orderItems.find((item) => !existingIds.includes(item.id));
      if (foreign) {
        throw new CustomError(`Order item ${foreign.id} does not belong to this order.`, 422);
      }

      const keptIds = orderItems.map((item) => item.id);
      const removedIds = existingIds.filter((itemId) => !keptIds.includes(itemId));
      // TypeORM refuses delete() with an empty criteria array.
      if (removedIds.length) {
        await manager.delete(OrderItem, removedIds);
      }

      await manager.save(
        OrderItem,
        orderItems.map((item) =>
          manager.create(OrderItem, { ...item, total_price: lineTotal(item), order_id: updatedOrder.id }),
        ),
      );
    }

    if (location_id) {
      const location = await findLocationSnapshot(manager, location_id);
      const alreadyThere = orderToUpdate.history.some(
        (entry) => (entry.from_location as { id?: string })?.id === location.id,
      );

      if (!alreadyThere) {
        await manager.save(OrderHistory, manager.create(OrderHistory, checkInHistory(updatedOrder.id, location)));
      }
    }

    await queryRunner.commitTransaction();

    return await getOrderById(updatedOrder.id);
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
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
