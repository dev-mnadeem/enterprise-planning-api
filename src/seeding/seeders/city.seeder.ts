import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { City as XCity } from 'country-state-city';
import { City, State } from '../../entities';

export default class CitiesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const cityRepository = dataSource.getRepository(City);
    const stateRepository = dataSource.getRepository(State);

    const states = await stateRepository.find({ relations: { country: true } });

    for (let state of states) {
      const citySeedData = XCity.getCitiesOfState(state.country.code, state.code) || [];

      for (let city of citySeedData) {
        const existedCity = cityRepository.findOneBy({ name: city.name, state_id: state.id });

        if (!existedCity) {
          const newCity = cityRepository.create({ name: city.name, state_id: state.id });
          await cityRepository.save(newCity);
        }
      }
    }
  }
}
