import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission } from '../../entities';

export default class PermissionsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const permissionRepository = dataSource.getRepository(Permission);

    const entityMetadatas = dataSource.entityMetadatas;
    const entityNames = entityMetadatas.map((metadata) => metadata.name);
    
    for (let entityName of entityNames) {
      const existedPermission = await permissionRepository.findOneBy({ name: entityName });

      if (!existedPermission) {
        const newPermission = permissionRepository.create({ name: entityName})
        await permissionRepository.save(newPermission);
      }
    }
  }
}
