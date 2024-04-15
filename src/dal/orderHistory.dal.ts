import { OrderHistory } from '../entities';
import { AppDataSource } from '../database/data-source';
import { getOrderByNumber } from './order.dal';
import { TOrdersIn, TOrdersOut } from '../schemas/orderHistory.schema';
import {
  MovementResult,
  MovementStatus,
  canMove,
  findLocationSnapshot,
  findVehicleSnapshot,
  historyFields,
} from '../utils/movement';

const orderHistoryRepository = AppDataSource.getRepository(OrderHistory);

const moveOrders = async (
  orderNumbers: string[],
  target: MovementStatus,
  buildEntry: (orderId: string) => Partial<OrderHistory>,
): Promise<MovementResult> => {
  const result: MovementResult = { success: [], failed: [] };

  for (const number of orderNumbers) {
    const order = await getOrderByNumber(number);
    const last = order
      ? await orderHistoryRepository.findOne({ where: { order_id: order.id }, order: { created_at: 'DESC' } })
      : null;

    // Booking an order "in" twice, or "out" twice, used to be accepted and
    // left the history saying it was in two places at once.
    if (!order || !canMove(last?.status, target)) {
      result.failed.push(number);
      continue;
    }

    await orderHistoryRepository.save(orderHistoryRepository.create(buildEntry(order.id)));
    result.success.push(number);
  }

  return result;
};

export const orderIn = async ({ order_numbers, location_id }: TOrdersIn): Promise<MovementResult> => {
  const location = await findLocationSnapshot(AppDataSource.manager, location_id);

  return moveOrders(order_numbers, 'in', (order_id) => ({
    ...historyFields(location),
    status: 'in',
    from_location: location,
    order_id,
  }));
};

export const orderOut = async (data: TOrdersOut): Promise<MovementResult> => {
  const manager = AppDataSource.manager;
  const from_location = await findLocationSnapshot(manager, data.from_location_id, 'From Location');
  // findOne({ where: { id: undefined } }) matches the first row in the table,
  // so an omitted destination used to become an arbitrary location.
  const to_location = data.to_location_id
    ? await findLocationSnapshot(manager, data.to_location_id, 'To Location')
    : undefined;
  const vehicle = await findVehicleSnapshot(manager, data.vehicle_id);

  return moveOrders(data.order_numbers, 'out', (order_id) => ({
    ...historyFields(from_location),
    status: 'out',
    from_location,
    to_location,
    vehicle,
    order_id,
  }));
};
