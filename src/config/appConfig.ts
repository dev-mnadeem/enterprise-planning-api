import dotenv from 'dotenv';
import { Environment } from '../types/environments';

dotenv.config();

export default {
  environment: process.env.ENVIRONMENT,
  isLocalOrTest: [Environment.local, Environment.test].includes(process.env.ENVIRONMENT as Environment),
  serverPort: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
    name: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  testDatabaseName: process.env.TEST_DATABASE_NAME,
  frontEndDomain: process.env.FRONT_END_DOMAIN,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  refreshTokenSecretKey: process.env.REFRESH_TOKEN_SECRET_KEY,
};
