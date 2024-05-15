import { Permission } from '../entities';
import { AppDataSource } from '../database/data-source';
import { TCreatePermission } from '../schemas/permission.schema';

const permissionRepository = AppDataSource.getRepository(Permission);

export const createPermission = async (permissionData: TCreatePermission): Promise<Permission> => {
  const newPermission = permissionRepository.create(permissionData);
  return await permissionRepository.save(newPermission);
};

export const getAllPermissions = async (): Promise<Permission[] | null> => {
  const permissions = await permissionRepository.find();
  return permissions;
};
