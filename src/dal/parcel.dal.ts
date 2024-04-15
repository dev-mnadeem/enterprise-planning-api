import { Location, Parcel, ParcelHistory, ParcelItem, Package, Pricing, User, OrderItem } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreateParcel, TUpdateParcel } from '../schemas/parcel.schema';
import { CustomError } from '../utils/customError';
import { getCityById } from './city.dal';
import { getPackageById } from './package.dal';
import { QueryRunner } from 'typeorm';
import { ParcelQueryParams } from '../types/parcel.interface';
import { addSearchToQuery } from '../utils/searchUtils';
import { buildPagination } from '../utils/paginationUtils';
import { resolveLocationScope, whereLatestHistoryIn } from '../utils/locationScope';
import { PageInfoResponse } from '../types/pagination.interface';
import { generateParcelNumber } from '../utils/generateParcelNumber';
import { splitQuantity } from '../utils/splitQuantity';
import { findLocationSnapshot, historyFields } from '../utils/movement';

const parcelRepository = AppDataSource.getRepository(Parcel);
const parcelHistoryRepository = AppDataSource.getRepository(ParcelHistory);

export const createParcel = async ({ location_id, parcel_data }: TCreateParcel): Promise<Parcel[]> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const location = await findLocationSnapshot(queryRunner.manager, location_id);
    const newParcels: Parcel[] = [];

    for (const item of parcel_data) {
      const orderItem = await queryRunner.manager.findOne(OrderItem, { where: { id: item.item_id } });

      if (!orderItem) {
        throw new CustomError('Order Item Not Found!', 404);
      }

      for (const quantity of splitQuantity(orderItem.quantity, item.number_of_barcodes)) {
        newParcels.push(await createCompleteParcel(quantity, orderItem, location, queryRunner));
      }
    }

    await queryRunner.commitTransaction();

    return newParcels;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const createCompleteParcel = async (
  quantity: number,
  orderItem: OrderItem,
  location: Location,
  queryRunner: QueryRunner,
) => {
  const manager = queryRunner.manager;
  const createdParcel = await manager.save(
    Parcel,
    manager.create(Parcel, { order_id: orderItem.order_id, parcel_number: generateParcelNumber() }),
  );

  const createdParcelItem = await manager.save(
    ParcelItem,
    manager.create(ParcelItem, { parcel_id: createdParcel.id, quantity, item_id: orderItem.id }),
  );
  createdParcel.parcel_items = [createdParcelItem];

  await manager.save(
    ParcelHistory,
    manager.create(ParcelHistory, {
      ...historyFields(location),
      status: 'in',
      from_location: location,
      parcel_id: createdParcel.id,
    }),
  );

  return createdParcel;
};

export const validateParcelNumber = async (
  parcel_number: string,
  status: string,
): Promise<{ is_valid: Boolean; message?: string; parcel_data?: object }> => {
  const parcel = await parcelRepository.findOne({
    where: { parcel_number },
  });

  if (!parcel) {
    return { is_valid: false, message: 'Given shipment number is not valid!' };
  }

  const lastParcelHistory = await parcelHistoryRepository.findOne({
    where: { parcel_id: parcel.id },
    relations: {
      parcel: {
        parcel_items: {
          order_item: {
            order: true,
          },
        },
        order: true,
      },
    },
    order: {
      created_at: 'DESC',
    },
  });

  if (!lastParcelHistory) {
    return { is_valid: false, message: 'Given shipment number is not valid!' };
  }

  if (lastParcelHistory.status === status) {
    return {
      is_valid: false,
      message:
        lastParcelHistory.status === 'in'
          ? 'Unable to add in inventory as parcel status is already in!'
          : 'Unable to out from inventory as parcel status is already out!',
    };
  }

  // decimal columns come back from pg as strings
  const parcel_weight = lastParcelHistory.parcel.parcel_items.reduce(
    (weight, item) => weight + item.quantity * Number(item.order_item.weight),
    0,
  );

  return {
    is_valid: true,
    parcel_data: { weight: parcel_weight, weight_type: lastParcelHistory.parcel.order.weight_type },
  };
};

export const getAllParcels = async (
  currentUser: User,
  params: ParcelQueryParams,
): Promise<{ pageInfo: PageInfoResponse; results: Parcel[] | null }> => {
  const { search, pageNumber, pageSize, sortBy, orderBy, locationId } = params;
  const scope = resolveLocationScope(currentUser, locationId);
  const { take, skip, pageNo } = buildPagination(pageNumber, pageSize);

  // A user with no assigned locations has nothing to list. Querying anyway
  // produced `IN ()`, a Postgres syntax error.
  if (scope.kind === 'locations' && !scope.ids.length) {
    return { pageInfo: { pageNumber: pageNo, pageSize: take, totalPages: 0, totalResults: 0 }, results: [] };
  }

  const query = parcelRepository
    .createQueryBuilder('parcel')
    .leftJoin('parcel.history', 'history')
    .leftJoin('parcel.parcel_items', 'parcel_items')
    .leftJoin('parcel.order', 'order')
    .leftJoin('order.sender_city', 'sender_city')
    .leftJoin('sender_city.state', 'sender_state')
    .leftJoin('sender_state.country', 'sender_country')
    .leftJoin('order.receiver_city', 'receiver_city')
    .leftJoin('receiver_city.state', 'receiver_state')
    .leftJoin('receiver_state.country', 'receiver_country')
    .select(['parcel.id', 'parcel.parcel_number', 'parcel.created_at'])
    .addSelect(['order.sender_name', 'order.sender_phone', 'order.receiver_name', 'order.receiver_phone'])
    .addSelect(['sender_city.name', 'sender_state.name', 'sender_country.name'])
    .addSelect(['receiver_city.name', 'receiver_state.name', 'receiver_country.name'])
    .addSelect([
      'history.name',
      'history.city',
      'history.status',
      'history.created_at',
    ])
    .where('parcel.deleted_at IS NULL')
    .orderBy(`parcel.created_at`, 'DESC');

  whereLatestHistoryIn(query, { alias: 'parcel', historyTable: 'parcel_history', foreignKey: 'parcel_id' }, scope);

  if (sortBy && Object.keys(parcelRepository.metadata.propertiesMap).includes(sortBy)) {
    query.orderBy(`parcel.${sortBy}`, orderBy || 'DESC');
  }

  if (search) {
    addSearchToQuery(query, `parcel.parcel_number`, search);
  }

  const parcelList = await query.take(take).skip(skip).getMany();

  const total = await query.getCount();
  const totalPages = Math.ceil(total / take);

  return {
    pageInfo: {
      pageNumber: pageNo,
      pageSize: take,
      totalPages,
      totalResults: total,
    },
    results: parcelList,
  };
};

export const getParcelById = async (id: string): Promise<Parcel | undefined> => {
  const parcel = await parcelRepository.findOne({
    where: { id },
    relations: {
      history: true,
      parcel_items: {
        order_item: true,
      },
      order: {
        sender_city: { state: { country: true } },
        receiver_city: { state: { country: true } },
      },
    },
    order: {
      history: {
        created_at: 'DESC',
      },
    },
  });

  if (!parcel) {
    throw new CustomError('Parcel Not Found!', 404);
  }

  return parcel;
};

export const getParcelByNumber = async (number: string): Promise<Parcel | null> => {
  const parcel = await parcelRepository.findOne({
    where: { parcel_number: number },
    relations: {
      history: true,
      parcel_items: true,
      order: {
        sender_city: { state: { country: true } },
        receiver_city: { state: { country: true } },
      },
    },
  });

  return parcel;
};

// export const updateParcel = async (
//   user_id: string,
//   id: string,
//   newData: TUpdateParcel,
// ): Promise<Parcel | undefined> => {
//   const queryRunner = AppDataSource.createQueryRunner();

//   await queryRunner.connect();
//   await queryRunner.startTransaction();

//   try {
//     const parcelRepository = queryRunner.manager.getRepository(Parcel);
//     const parcelItemRepository = queryRunner.manager.getRepository(ParcelItem);

//     const parcelToUpdate = await parcelRepository.findOne({
//       where: { id },
//       relations: ['parcel_items', 'history'],
//     });

//     if (!parcelToUpdate) {
//       throw new CustomError('Parcel Not Found!', 404);
//     }

//     const { parcelItems, pricing, location_id, package_id, ...parcelDetails } = newData;

//     let parcelPackage: Partial<Package> | undefined = undefined;

//     if (package_id) {
//       const pkg = await queryRunner.manager.findOne(Package, {
//         where: { id: package_id },
//         select: {
//           name: true,
//           width: true,
//           height: true,
//           depth: true,
//           weight_limit: true,
//           weight_type: true,
//           route: true,
//         },
//       });

//       if (!pkg) {
//         throw new CustomError('Package Not Found!', 404);
//       }
//       parcelPackage = pkg;
//     }

//     let newPricing = {};

//     if (pricing) {
//       const exitingPricing = await queryRunner.manager.findOne(Pricing, {
//         where: { from_city_id: pricing.from_city_id, to_city_id: pricing.to_city_id, package_id: pricing.package_id },
//         select: {
//           id: true,
//           price: true,
//         },
//         relations: {
//           from_city: true,
//           to_city: true,
//           package: true,
//         },
//       });

//       if (exitingPricing) {
//         newPricing = exitingPricing;
//       } else {
//         const from_city = await getCityById(pricing.from_city_id);
//         const to_city = await getCityById(pricing.to_city_id);
//         const pkg = pricing.package_id ? await getPackageById(pricing.package_id) : undefined;

//         const createdPricing = queryRunner.manager.create(Pricing, {
//           from_city,
//           to_city,
//           package: pkg,
//           price: pricing.price,
//         });
//         newPricing = await queryRunner.manager.save(Pricing, createdPricing);
//       }
//     }

//     // Update parcel details
//     const updatedParcel = parcelRepository.merge(parcelToUpdate, {
//       ...parcelDetails,
//       user_id,
//       package: parcelPackage,
//       pricing: newPricing,
//     });
//     await queryRunner.manager.save(Parcel, updatedParcel);

//     if (parcelItems) {
//       // Update parcel items
//       const existingParcelItemIds = parcelToUpdate.parcel_items.map((item) => item.id);
//       const newParcelItemIds = parcelItems.map((item) => item.id).filter((id) => id !== undefined);

//       // Find items to remove
//       const itemsToRemove = existingParcelItemIds.filter((id) => !newParcelItemIds.includes(id));

//       // Remove old items that are not in the new items
//       await queryRunner.manager.delete(ParcelItem, itemsToRemove);

//       // Update or add new items
//       const newParcelItems = parcelItems.map((item) => {
//         return parcelItemRepository.create({
//           ...item,
//           total_price: item.quantity * (item?.price ? item.price : 0),
//           parcel_id: updatedParcel.id,
//         });
//       });

//       await queryRunner.manager.save(ParcelItem, newParcelItems);

//       // Update the parcel's parcelItems
//       updatedParcel.parcel_items = newParcelItems;
//     }

//     if (location_id) {
//       const location = await queryRunner.manager.findOne(Location, {
//         where: { id: location_id },
//         select: {
//           name: true,
//           description: true,
//           address: true,
//           geo_location: true,
//         },
//         relations: { city: { state: { country: true } } },
//       });

//       if (!location) {
//         throw new CustomError('Location Not Found!', 404);
//       }

//       const {
//         name,
//         city: { name: city },
//         description,
//         address,
//         geo_location,
//       } = location;

//       const parcelHistory = await queryRunner.manager.findOne(ParcelHistory, {
//         where: { name, address, geo_location, parcel_id: updatedParcel.id },
//       });

//       if (!parcelHistory) {
//         const parcelHistoryData = {
//           name,
//           city,
//           description,
//           address,
//           geo_location,
//           status: 'in',
//           from_location: location,
//           parcel_id: updatedParcel.id,
//         };
//         // Create parcel history
//         const newParcelHistory = queryRunner.manager.create(ParcelHistory, parcelHistoryData);

//         //Save parcel history
//         await queryRunner.manager.save(ParcelHistory, newParcelHistory);

//         // Assign saved parcel history to the parcel
//         updatedParcel.history = [...updatedParcel.history, newParcelHistory];
//       }
//     }

//     // Commit the transaction
//     await queryRunner.commitTransaction();

//     return await getParcelById(updatedParcel.id);
//   } catch (err) {
//     // Rollback the transaction on error
//     await queryRunner.rollbackTransaction();
//     throw err;
//   } finally {
//     // Release the query runner
//     await queryRunner.release();
//   }
// };

export const deleteParcel = async (id: string): Promise<boolean> => {
  const result = await parcelRepository.softDelete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('Parcel Not Found!', 404);
  }

  return isDeleted;
};
