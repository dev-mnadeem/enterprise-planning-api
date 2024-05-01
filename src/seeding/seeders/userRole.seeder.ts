import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserRole } from '../../entities';

const userRoles = ['admin', 'manager', 'driver', 'employee', 'customer']

export default class UserRolesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRoleRepository = dataSource.getRepository(UserRole);
    
    for (let userRole of userRoles) {
      const existedUserRole = await userRoleRepository.findOneBy({ name: userRole });

      if (!existedUserRole) {
        const newUserRole = userRoleRepository.create({ name: userRole })
        await userRoleRepository.save(newUserRole);
      }
    }
  }
}
