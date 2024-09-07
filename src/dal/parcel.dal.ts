import { Location, Parcel, ParcelHistory, ParcelItem, Package, Pricing, User, OrderItem } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreateParcel, TUpdateParcel } from '../schemas/parcel.schema';
import { CustomError } from '../utils/customError';
import { getCityById } from './city.dal';
import { getPackageById } from './package.dal';
import { Brackets, QueryRunner } from 'typeorm';
import { ParcelQueryParams } from '../types/parcel.interface';
import { addSearchToQuery } from '../utils/searchUtils';
import { buildPagination } from '../utils/paginationUtils';
import { PageInfoResponse } from '../types/pagination.interface';
import { generateParcelNumber } from '../utils/generateParcelNumber';

const parcelRepository = AppDataSource.getRepository(Parcel);
const parcelHistoryRepository = AppDataSource.getRepository(ParcelHistory);

export const createParcel = async (parcelData: TCreateParcel): Promise<Parcel[]> => {
  const queryRunner = AppDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const { location_id, parcel_data } = parcelData;
    const newParcels: Parcel[] = [];

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

    if (!location) {
      throw new CustomError('Location Not Found!', 404);
    }

    for (const item of parcel_data) {
      const orderItem = await queryRunner.manager.findOne(OrderItem, {
        where: { id: item.item_id },
        relations: {
          order: true,
        },
      });

      if (!orderItem) {
        throw new CustomError('Order Item Not Found!', 404);
      }

      const numberOfParcel = Math.floor(orderItem.quantity / item.number_of_barcodes);
      const createdParcels: Parcel[] = [];

      for (let i = 0; i <= numberOfParcel; i++) {
        const parcel = await createCompleteParcel(item.number_of_barcodes, orderItem, location, queryRunner);
        createdParcels.push(parcel);
      }

      const itemsQuantity = createdParcels.reduce((quantity, parcel) => quantity + parcel.parcel_item.quantity, 0);

      if (orderItem.quantity !== itemsQuantity) {
        const quantity = orderItem.quantity - itemsQuantity;
        const parcel = await createCompleteParcel(quantity, orderItem, location, queryRunner);
        createdParcels.push(parcel);
      }
      newParcels.push(...createdParcels);
    }

    // Commit transaction
    await queryRunner.commitTransaction();

    return newParcels;
  } catch (error) {
    // Rollback transaction in case of error
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    // Release the query runner
    await queryRunner.release();
  }
};

const createCompleteParcel = async (
  quantity: number,
  orderItem: OrderItem,
  location: Location,
  queryRunner: QueryRunner,
) => {
  const {
    name,
    city: { name: city },
    description,
    address,
    geo_location,
  } = location;

  const parcel_number = generateParcelNumber();
  const newParcelData = { order_id: orderItem.order_id, parcel_number };
  const newParcel = queryRunner.manager.create(Parcel, newParcelData);
  const createdParcel = await queryRunner.manager.save(Parcel, newParcel);

  const parcelItemData = {
    parcel_id: createdParcel.id,
    quantity,
  };

  const newParcelItem = queryRunner.manager.create(ParcelItem, parcelItemData);
  const createdParcelItem = await queryRunner.manager.save(ParcelItem, newParcelItem);

  createdParcel.parcel_item = createdParcelItem;

  const parcelHistoryData = {
    name,
    city,
    description,
    address,
    geo_location,
    status: 'in',
    from_location: location,
    parcel_id: createdParcel.id,
  };

  const newParcelHistory = queryRunner.manager.create(ParcelHistory, parcelHistoryData);
  await queryRunner.manager.save(ParcelHistory, newParcelHistory);

  return createdParcel;
};

export const validateParcelNumber = async (
  parcel_number: string,
  status: string,
): Promise<{ is_valid: Boolean; message?: string }> => {
  const parcel = await parcelRepository.findOne({
    where: { parcel_number },
  });

  if (!parcel) {
    return { is_valid: false, message: 'Given shipment number is not valid!' };
  }

  const lastParcelHistory = await parcelHistoryRepository.findOne({
    where: { parcel_id: parcel.id },
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

  return { is_valid: true };
};

export const getAllParcels = async (
  currentUser: User,
  params: ParcelQueryParams,
): Promise<{ pageInfo: PageInfoResponse; results: Parcel[] | null }> => {
  const { search, pageNumber, pageSize, sortBy, orderBy, locationId } = params;
  const { locations } = currentUser;
  const locationIds = locations.map((location) => location.id);
  const query = await parcelRepository
    .createQueryBuilder('parcel')
    .leftJoin('parcel.history', 'history')
    .leftJoin('parcel.parcel_item', 'parcel_item')
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
      // 'history.from_location',
      // 'history.to_location',
      'history.created_at',
    ])
    .where('parcel.deleted_at IS NULL')
    .orderBy(`parcel.created_at`, 'DESC');

  // Subquery to get the latest history entry for each parcel
  const subQuery = `SELECT "history"."parcel_id", MAX("history"."created_at") AS "max_created_at"
                    FROM "parcel_history" "history"
                    GROUP BY "history"."parcel_id"`;

  if (locationId) {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          `history.created_at IN (
            SELECT "max_created_at"
            FROM (${subQuery}) AS "latest"
            WHERE "latest"."parcel_id" = "parcel"."id"
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
            WHERE "latest"."parcel_id" = "parcel"."id"
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

  if (sortBy && Object.keys(parcelRepository.metadata.propertiesMap).includes(sortBy)) {
    query.orderBy(`parcel.${sortBy}`, orderBy || 'DESC');
  }

  if (search) {
    addSearchToQuery(query, `parcel.parcel_number`, search);
  }

  const { take, skip, pageNo } = buildPagination(pageNumber, pageSize);
  // const parcelList = await query.take(take).skip(skip).getMany();
  const parcelList = await query.getMany();

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
      parcel_item: true,
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
      parcel_item: true,
      order: {
        sender_city: { state: { country: true } },
        receiver_city: { state: { country: true } },
      }
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
