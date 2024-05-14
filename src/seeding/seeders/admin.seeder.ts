import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../../entities';
import { hashPassword } from '../../utils/passwordUtils';
import * as userRoleService from '../../dal/userRole.dal';
import * as userService from '../../dal/user.dal';

export default class AdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    const existedUser = await userRepository.findOneBy({ email: 'admin@example.com' });

    if (!existedUser) {
      const encryptedPassword = await hashPassword('admin');
      const customerUserRole = await userRoleService.getUserRoleByName('admin');

      await userService.createUser({
        name: 'admin',
        email: 'admin@example.com',
        password: encryptedPassword,
        role_id: customerUserRole?.id,
        permissions: customerUserRole?.permissions,
      });
    }
  }
}
