import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { VehicleType } from '../../entities';

const vehicleTypes = ['bike', 'van', 'ship', 'air-plane'];

export default class VehicleTypesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const vehicleTypeRepository = dataSource.getRepository(VehicleType);

    for (let vehicleType of vehicleTypes) {
      const existedVehicleType = await vehicleTypeRepository.findOneBy({ name: vehicleType });

      if (!existedVehicleType) {
        const newUserRole = vehicleTypeRepository.create({ name: vehicleType });
        await vehicleTypeRepository.save(newUserRole);
      }
    }
  }
}
