import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Permission, User } from '../../entities';
import { hashPassword } from '../../utils/passwordUtils';
import * as userRoleService from '../../dal/userRole.dal';
import * as userService from '../../dal/user.dal';

export default class AdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    const existedUser = await userRepository.findOneBy({ email: 'admin@example.com' });

    if (!existedUser) {
      const encryptedPassword = await hashPassword('Helloworld');
      const adminUserRole = await userRoleService.getUserRoleByName('admin');

      const permissions: object[] = adminUserRole?.permissions;

      const adminUser = userRepository.create({
        name: 'admin',
        email: 'admin@example.com',
        password: encryptedPassword,
        role_id: adminUserRole?.id,
        phone_number: '+123456789',
        permissions
      });

      await userRepository.save(adminUser);
    }
  }
}
