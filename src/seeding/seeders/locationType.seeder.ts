import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { LocationType } from '../../entities';

const locationTypes = ['branch', 'franchise', 'warehouse'];

export default class LocationTypesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const locationTypeRepository = dataSource.getRepository(LocationType);

    for (let locationType of locationTypes) {
      const existedLocationType = locationTypeRepository.findOneBy({ name: locationType });

      if (!existedLocationType) {
        const newUserRole = locationTypeRepository.create({ name: locationType });
        await locationTypeRepository.save(newUserRole);
      }
    }
  }
}
