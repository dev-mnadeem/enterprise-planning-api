import { Parcel, ParcelHistory } from '../entities';
import { AppDataSource } from '../database/data-source';
import { getParcelByNumber } from './parcel.dal';
import { TParcelsIn, TParcelsOut } from '../schemas/parcelHistory.schema';
import {
  MovementResult,
  MovementStatus,
  canMove,
  findContainerSnapshot,
  findLocationSnapshot,
  findVehicleSnapshot,
  historyFields,
} from '../utils/movement';

const parcelHistoryRepository = AppDataSource.getRepository(ParcelHistory);

const moveParcels = async (
  parcelNumbers: string[],
  target: MovementStatus,
  buildEntry: (parcelId: string) => Partial<ParcelHistory>,
): Promise<MovementResult> => {
  const result: MovementResult = { success: [], failed: [] };

  for (const number of parcelNumbers) {
    const parcel = await getParcelByNumber(number);
    const last = parcel
      ? await parcelHistoryRepository.findOne({ where: { parcel_id: parcel.id }, order: { created_at: 'DESC' } })
      : null;

    if (!parcel || !canMove(last?.status, target)) {
      result.failed.push(number);
      continue;
    }

    await parcelHistoryRepository.save(parcelHistoryRepository.create(buildEntry(parcel.id)));
    result.success.push(number);
  }

  return result;
};

export const parcelIn = async ({ parcel_numbers, location_id }: TParcelsIn): Promise<MovementResult> => {
  const location = await findLocationSnapshot(AppDataSource.manager, location_id);

  return moveParcels(parcel_numbers, 'in', (parcel_id) => ({
    ...historyFields(location),
    status: 'in',
    from_location: location,
    parcel_id,
  }));
};

export const parcelOut = async (data: TParcelsOut): Promise<MovementResult> => {
  const manager = AppDataSource.manager;
  const from_location = await findLocationSnapshot(manager, data.from_location_id, 'From Location');
  const to_location = data.to_location_id
    ? await findLocationSnapshot(manager, data.to_location_id, 'To Location')
    : undefined;
  // A parcel leaves either on a vehicle or inside a container; the snapshot
  // goes in the same `vehicle` column, and a container wins if both are sent.
  const carrier = data.container_id
    ? await findContainerSnapshot(manager, data.container_id)
    : await findVehicleSnapshot(manager, data.vehicle_id!);

  return moveParcels(data.parcel_numbers, 'out', (parcel_id) => ({
    ...historyFields(from_location),
    status: 'out',
    from_location,
    to_location,
    vehicle: carrier,
    parcel_id,
  }));
};

/** Parcels that have been loaded into the container with this tracking number. */
export const getContainerParcelsByTrackingNumber = async (tracking_number: string): Promise<Parcel[]> => {
  // vehicle is a plain json column; find({ where: { vehicle: {...} } }) cannot
  // compare it, so match the key with ->> instead.
  const entries = await parcelHistoryRepository
    .createQueryBuilder('history')
    .innerJoinAndSelect('history.parcel', 'parcel')
    .where("history.vehicle->>'tracking_number' = :tracking_number", { tracking_number })
    .getMany();

  const unique = new Map(entries.map((entry) => [entry.parcel.id, entry.parcel]));
  return [...unique.values()];
};
