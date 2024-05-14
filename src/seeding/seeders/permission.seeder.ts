import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission } from '../../entities';
import { PERMISSIONS } from '../../constants';

export default class PermissionsSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const permissionRepository = dataSource.getRepository(Permission);
    
    for (let permission of PERMISSIONS) {
      const existedPermission = await permissionRepository.findOneBy({ name: permission });

      if (!existedPermission) {
        const newPermission = permissionRepository.create({ name: permission})
        await permissionRepository.save(newPermission);
      }
    }
  }
}
