import { Permission } from '../entities';
import { AppDataSource } from '../database/data-source';

const permissionRepository = AppDataSource.getRepository(Permission);

export const getAllPermissions = async (): Promise<Permission[] | null> => {
  const permissions = await permissionRepository.find();
  return permissions;
};
