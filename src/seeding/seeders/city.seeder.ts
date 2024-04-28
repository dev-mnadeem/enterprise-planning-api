import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { City, Country } from '../../entities';
import { City as XCity } from 'country-state-city';

export default class CitiesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const cityRepository = dataSource.getRepository(City);
    const countryRepository = dataSource.getRepository(Country);

    const countries = await countryRepository.find();

    for (let country of countries) {
      const citySeedData = XCity.getCitiesOfCountry(country.code) || [];

      for (let city of citySeedData) {
        const newCity = cityRepository.create({ name: city.name, country_id: country.id });
        await cityRepository.save(newCity);
      }
    }
  }
}
