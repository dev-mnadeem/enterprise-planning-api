import { AppDataSource } from '../database/data-source';
import { runSeeders } from 'typeorm-extension';

(async () => {
  const dataSource = await AppDataSource.initialize();

  await runSeeders(dataSource, {
    seeds: ['src/seeding/seeders/country.seeder.ts'],
  });
})();
