import * as entities from '../entities';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';

import appConfig from '../config/appConfig';
import { Environment } from '../types/environments';

const prodDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: appConfig.isLocalOrTest ? '' : appConfig.database.url,
  logging: false,
  // TypeORM alters the live schema to match the entities on every boot when
  // this is on, which can drop columns. Migrations belong here instead.
  synchronize: false,
  entities,
  ssl: { rejectUnauthorized: false },
};

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: appConfig.database.host,
  port: 5432,
  username: appConfig.database.user,
  password: appConfig.database.password,
  database: appConfig.environment === Environment.test ? appConfig.testDatabaseName : appConfig.database.name,
  logging: true,
  synchronize: true,
  entities
};

const AppDataSource = new DataSource(
  appConfig.isLocalOrTest ? dataSourceOptions : prodDataSourceOptions,
);

const connectToDatabase = async () => {
  try {
    if (appConfig.isLocalOrTest) {
      await createDatabase({
        options: dataSourceOptions,
        ifNotExist: true,
        // Without this it connects to a database named after the user, which
        // does not exist on a stock Postgres image.
        initialDatabase: 'postgres',
      });
    }
    await AppDataSource.initialize();
    await AppDataSource.synchronize();
    console.log('Connection Established with PostgreSQL Database.');
  } catch (err: unknown) {
    console.error("ERROR: Couldn't connect to database", err);
    // Rethrow. Starting an API that cannot reach its database means every
    // request 500s while the process looks healthy to a load balancer.
    throw err;
  }
};

const disconnectFromDatabase = async () => {
  try {
    if (appConfig.environment === Environment.test) {
      await AppDataSource.dropDatabase();
    }
    await AppDataSource.destroy();
  } catch (err) {
    console.log('Couldnt disconnect from database');
  }
};

export { AppDataSource, connectToDatabase, disconnectFromDatabase };
