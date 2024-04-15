import { Seeder } from 'typeorm-extension';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';

import {
  City,
  Country,
  Location,
  LocationType,
  Package,
  Pricing,
  State,
  User,
  UserRole,
  Vehicle,
  VehicleType,
} from '../../entities';
import { hashPassword } from '../../utils/passwordUtils';
import { generateShipmentNumber } from '../../utils/shipmentNumber';

const findOrCreate = async <T extends ObjectLiteral>(
  repository: Repository<T>,
  where: Partial<T>,
  values: Partial<T> = {},
): Promise<T> => {
  const existing = await repository.findOneBy(where);
  if (existing) return existing;
  return repository.save(repository.create({ ...where, ...values } as T));
};

/**
 * A small, idempotent dataset for trying the API end to end: three Ghanaian
 * cities (plus Nigeria as a container destination), a branch and a warehouse in each region, one van with a driver, a
 * parcel size and a price between Accra and Kumasi. The full country, state
 * and city seeders load tens of thousands of rows; this needs only the role,
 * location-type and vehicle-type seeders to have run first.
 */
export default class DemoSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const countries = dataSource.getRepository(Country);
    const states = dataSource.getRepository(State);
    const cities = dataSource.getRepository(City);
    const locations = dataSource.getRepository(Location);
    const users = dataSource.getRepository(User);

    const ghana = await findOrCreate(countries, { code: 'GH' }, { name: 'Ghana', status: true });
    // A second country so sea containers have somewhere to go.
    await findOrCreate(countries, { code: 'NG' }, { name: 'Nigeria', status: true });
    const accraRegion = await findOrCreate(states, { code: 'AA', country_id: ghana.id }, { name: 'Greater Accra' });
    const ashanti = await findOrCreate(states, { code: 'AH', country_id: ghana.id }, { name: 'Ashanti' });

    const accra = await findOrCreate(cities, { name: 'Accra', state_id: accraRegion.id });
    const tema = await findOrCreate(cities, { name: 'Tema', state_id: accraRegion.id });
    const kumasi = await findOrCreate(cities, { name: 'Kumasi', state_id: ashanti.id });

    const locationType = async (name: string) => dataSource.getRepository(LocationType).findOneByOrFail({ name });
    const branch = await locationType('branch');
    const warehouse = await locationType('warehouse');

    const demoLocations = [
      await findOrCreate(
        locations,
        { name: 'Accra Central Branch' },
        { city_id: accra.id, location_type_id: branch.id, status: true, address: 'Kojo Thompson Road' },
      ),
      await findOrCreate(
        locations,
        { name: 'Tema Port Warehouse' },
        { city_id: tema.id, location_type_id: warehouse.id, status: true, address: 'Harbour Road' },
      ),
      await findOrCreate(
        locations,
        { name: 'Kumasi Branch' },
        { city_id: kumasi.id, location_type_id: branch.id, status: true, address: 'Kejetia Market Road' },
      ),
    ];

    const admins = await users.find({ where: { user_role: { name: 'admin' } }, relations: { locations: true } });
    for (const admin of admins) {
      const missing = demoLocations.filter((location) => !admin.locations.some((own) => own.id === location.id));
      if (missing.length) {
        await users.createQueryBuilder().relation(User, 'locations').of(admin.id).add(missing);
      }
    }

    const driverRole = await dataSource.getRepository(UserRole).findOneByOrFail({ name: 'driver' });
    const driver =
      (await users.findOneBy({ phone_number: '+233200000001' })) ??
      (await users.save(
        users.create({
          name: 'Demo Driver',
          email: 'driver@example.com',
          phone_number: '+233200000001',
          password: await hashPassword('Helloworld'),
          role_id: driverRole.id,
        }),
      ));

    const van = await dataSource.getRepository(VehicleType).findOneByOrFail({ name: 'van' });
    await findOrCreate(
      dataSource.getRepository(Vehicle),
      { registration_number: 'GR 1024-24' },
      {
        name: 'Accra shuttle',
        model: 'Toyota Hiace',
        vehicle_type_id: van.id,
        driver_id: driver.id,
        tracking_number: generateShipmentNumber(),
      },
    );

    const smallBox = await findOrCreate(
      dataSource.getRepository(Package),
      { name: 'Small box (up to 5 kg)' },
      { route: 'road', weight_type: 'kg', weight_limit: 5 },
    );

    await findOrCreate(
      dataSource.getRepository(Pricing),
      { from_city_id: accra.id, to_city_id: kumasi.id, package_id: smallBox.id, route: 'road' },
      { price: 45 },
    );
  }
}
