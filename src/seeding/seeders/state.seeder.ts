import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { State as XState } from 'country-state-city';
import { Country, State } from '../../entities';

export default class StatesSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<any> {
    const stateRepository = dataSource.getRepository(State);
    const countryRepository = dataSource.getRepository(Country);

    const countries = await countryRepository.find();

    for (let country of countries) {
      const stateSeedData = XState.getStatesOfCountry(country.code) || [];

      for (let state of stateSeedData) {
        const existedState = stateRepository.findOneBy({ code: state.isoCode, country_id: country.id });

        if (!existedState) {
          const newState = stateRepository.create({ name: state.name, code: state.isoCode, country_id: country.id });
          await stateRepository.save(newState);
        }
      }
    }
  }
}
