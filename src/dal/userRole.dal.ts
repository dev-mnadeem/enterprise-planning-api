import { USER_ROLES } from '../constants';
import { AppDataSource } from '../database/data-source';
import { UserRole } from '../entities';
import { TCreatePermission } from '../schemas/permission.schema';
import { CustomError } from '../utils/customError';

const userRoleRepository = AppDataSource.getRepository(UserRole);

export const createUserRole = async (name: string, permissions: TCreatePermission[] | undefined): Promise<UserRole> => {
  if (USER_ROLES.includes(name.toLowerCase())) {
    throw new CustomError("You Can't keep this name choose different one!", 400);
  }

  const newUserRole = userRoleRepository.create({ name, permissions });
  return await userRoleRepository.save(newUserRole);
};

export const getUserRoleById = async (id: string): Promise<UserRole | undefined> => {
  const userRole = await userRoleRepository.findOneOrFail({ where: { id } });

  if (!userRole) {
    throw new CustomError('User Role Not Found!', 404);
  }

  return userRole;
};

export const getUserRoleByName = async (name: string): Promise<UserRole | undefined> => {
  const userRole = await userRoleRepository.findOneOrFail({ where: { name } });

  if (!userRole) {
    throw new CustomError('User Role Not Found!', 404);
  }

  return userRole;
};

export const getAllUserRoles = async (): Promise<UserRole[]> => {
  return await userRoleRepository.find();
};

export const updateUserRole = async (id: string, name: string): Promise<UserRole | null> => {
  const userRoleToUpdate = await userRoleRepository.findOneOrFail({ where: { id } });

  if (!userRoleToUpdate) {
    throw new CustomError('User Role Not Found!', 404);
  }

  userRoleToUpdate.name = name;
  return await userRoleRepository.save(userRoleToUpdate);
};

export const deleteUserRole = async (id: string): Promise<boolean> => {
  const result = await userRoleRepository.delete(id);
  const isDeleted = result.affected !== 0;

  if (!isDeleted) {
    throw new CustomError('User Role Not Found!', 404);
  }

  return isDeleted
};
