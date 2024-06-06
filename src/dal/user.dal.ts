import { Location, User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreateUser, TUpdateUser } from '../schemas/user.schema';
import { CustomError } from '../utils/customError';
import { getUserRoleByName } from './userRole.dal';
import { Not } from 'typeorm';
import { getLocationByIds } from './location.dal';

const userRepository = AppDataSource.getRepository(User);

export const createUser = async ({ location_ids, ...userData }: TCreateUser): Promise<User> => {
  let locations = [] as Location[];

  if (location_ids?.length) {
    locations = await getLocationByIds(location_ids); 
  }

  const newUser = userRepository.create({ ...userData, locations });

  return await userRepository.save(newUser);
};

export const getAllUsers = async (): Promise<User[] | null> => {
  const adminUserRole = await getUserRoleByName('admin');
  const users = await userRepository.find({
    where: { role_id: Not(adminUserRole?.id || '') },
    relations: { user_role: true },
  });
  return users;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await userRepository.findOne({ where: { id }, relations: { user_role: true } });

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
  return userRepository.findOne({ where: { email }, relations: { user_role: true } });
};

export const getUserByPhone = (phone_number: string): Promise<User | null> => {
  return userRepository.findOne({ where: { phone_number }, relations: { user_role: true } });
};

export const getUserByRefreshToken = (refreshToken: string): Promise<User | null> => {
  return userRepository.findOne({ where: { refresh_token: refreshToken } });
};
