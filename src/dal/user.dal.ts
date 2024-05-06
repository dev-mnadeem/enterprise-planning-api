import { User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TUpdateUser } from '../schemas/user.schema';
import { CustomError } from '../utils/customError';

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const newUser = userRepository.create(userData);
  return await userRepository.save(newUser);
};

export const getAllUsers = async (): Promise<User[] | null> => {
  const users = await userRepository.find({ relations: { user_role: true } });
  return users;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await userRepository.findOneOrFail({ where: { id }, relations: { user_role: true } });

  if (!user) {
    throw new CustomError('User Not Found', 404);
  }

  return user;
};

export const updateUser = async (id: string, newData: TUpdateUser): Promise<User | null> => {
  const userToUpdate = await userRepository.findOneOrFail({
    where: { id },
    relations: { user_role: true }
  });

  if (!userToUpdate) {
    throw new CustomError('User Not Found', 404);
  }

  const updatedUser = { ...userToUpdate, ...newData };
  return await userRepository.save(updatedUser);
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const result = await userRepository.delete(id);
  return result.affected !== 0;
};

export const getUserByEmail = (email: string): Promise<User | null> => {
  return userRepository.findOne({ where: { email } });
};

export const getUserByRefreshToken = (refreshToken: string): Promise<User | null> => {
  return userRepository.findOne({ where: { refresh_token: refreshToken } });
};
