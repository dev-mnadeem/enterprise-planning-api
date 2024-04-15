import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission, UserRole } from '../../entities';
import { USER_ROLES } from '../../constants';

export default class UserRolesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRoleRepository = dataSource.getRepository(UserRole);
    const permissionRepository = dataSource.getRepository(Permission);
    
    for (let userRole of USER_ROLES) {
      const existedUserRole = await userRoleRepository.findOneBy({ name: userRole });

      if (!existedUserRole) {
        let permissions;
        if (userRole === 'admin') {
          permissions = await permissionRepository.find({ select: ['name', 'properties'] });
        }
        const newUserRole = userRoleRepository.create({ name: userRole, permissions })
        await userRoleRepository.save(newUserRole);
      }
    }
  }
}
