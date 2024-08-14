import { Location, User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreateUser, TUpdateUser } from '../schemas/user.schema';
import { CustomError } from '../utils/customError';
import { getUserRoleByName } from './userRole.dal';
import { Not } from 'typeorm';
import { getLocationByIds } from './location.dal';
import { UserQueryParams } from '../types/user.interface';
import { buildPagination } from '../utils/paginationUtils';
import { PageInfoResponse } from '../types/pagination.interface';
import { addSearchToQuery } from '../utils/searchUtils';

const userRepository = AppDataSource.getRepository(User);

export const createUser = async ({ location_ids, ...userData }: TCreateUser): Promise<User> => {
  let locations = [] as Location[];

  if (location_ids?.length) {
    locations = await getLocationByIds(location_ids);
  }

  const newUser = userRepository.create({ ...userData, locations });

  return await userRepository.save(newUser);
};

export const getAllUsers = async (
  params: UserQueryParams,
): Promise<{ pageInfo: PageInfoResponse; results: User[] | null }> => {
  const { search, role, pageNumber, pageSize, sortBy, orderBy, phoneNumber } = params;

  const query = userRepository
    .createQueryBuilder('user')
    .select()
    .leftJoinAndSelect('user.user_role', 'user_role')
    .leftJoinAndSelect('user.locations', 'locations')
    .where('user_role.name != :roleName', { roleName: 'admin' });

  if (sortBy && Object.keys(userRepository.metadata.propertiesMap).includes(sortBy)) {
    query.orderBy(`user.${sortBy}`, orderBy || 'DESC');
  }

  if (search) {
    addSearchToQuery(query, `user.name || ' ' || coalesce(user.email, '')`, search);
  }

  if (role) {
    query.andWhere('user_role.name = :role', { role });
  }

  if (phoneNumber) {
    query.andWhere('user.phone_number = :phoneNumber', { phoneNumber });
  }

  const { take, skip, pageNo } = buildPagination(pageNumber, pageSize);
  const userList = await query.take(take).skip(skip).getMany();

  const total = await query.getCount();
  const totalPages = Math.ceil(total / take);

  return {
    pageInfo: {
      pageNumber: pageNo,
      pageSize: take,
      totalPages,
      totalResults: total,
    },
    results: userList,
  };
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await userRepository.findOne({ where: { id }, relations: { user_role: true, locations: true } });

  if (!user) {
    throw new CustomError('User Not Found!', 404);
  }

  return user;
};

export const updateUser = async (id: string, { location_ids, ...newData }: TUpdateUser): Promise<User | null> => {
  const userToUpdate = await userRepository.findOne({
    where: { id },
    relations: { user_role: true },
  });

  if (!userToUpdate) {
    throw new CustomError('User Not Found!', 404);
  }

  let locations = userToUpdate.locations;

  if (location_ids?.length) {
    locations = await getLocationByIds(location_ids);
  }

  const updatedUser = { ...userToUpdate, ...newData, locations };
  return await userRepository.save(updatedUser);
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await userRepository.delete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('User Not Found!', 404);
  }

  return isDeleted;
};

export const getUserByEmail = (email: string): Promise<User | null> => {
  return userRepository.findOne({
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      address: true,
      geo_location: true,
      status: true,
      permissions: true,
      password: true,
      refresh_token: true,
      locations: {
        name: true,
        description: true,
        address: true,
        city: {
          id: true,
          name: true,
          state: {
            id: true,
            name: true,
            country: {
              id: true,
              name: true,
            },
          },
        },
      },
      user_role: {
        name: true,
      },
    },
    where: { email },
    relations: { user_role: true, locations: { city: { state: { country: true } } } },
  });
};

export const getUserByPhone = (phone_number: string): Promise<User | null> => {
  return userRepository.findOne({
    select: {
      id: true,
      name: true,
      email: true,
      phone_number: true,
      address: true,
      geo_location: true,
      status: true,
      permissions: true,
      password: true,
      refresh_token: true,
      locations: {
        name: true,
        description: true,
        address: true,
        city: {
          id: true,
          name: true,
          state: {
            id: true,
            name: true,
            country: {
              id: true,
              name: true,
            },
          },
        },
      },
      user_role: {
        name: true,
      },
    },
    where: { phone_number },
    relations: { user_role: true, locations: { city: { state: { country: true } } } },
  });
};

export const getUserByRefreshToken = (refreshToken: string): Promise<User | null> => {
  return userRepository.findOne({ where: { refresh_token: refreshToken } });
};
