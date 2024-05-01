import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Country as XCountry } from 'country-state-city';
import { Country } from '../../entities';

export default class CountriesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const countryRepository = dataSource.getRepository(Country);

    const countrySeedData = XCountry.getAllCountries();
    
    for (let country of countrySeedData) {
      const newCountry = countryRepository.create({ name: country.name, code: country.isoCode, status: false })
      await countryRepository.save(newCountry);
    }
  }
}
