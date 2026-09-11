import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { Server } from 'http';

import appConfig from './config/appConfig';
import { connectToDatabase } from './database/data-source';
import { router } from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy!' });
});

// cors() with no arguments allows every origin. FRONT_END_DOMAIN was already
// in the config and in .env.example, but nothing read it. The login route sets
// an httpOnly refresh cookie, so credentials have to be allowed explicitly for
// the origins we actually serve -- and only those.
const allowedOrigins = (appConfig.frontEndDomain ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : false,
    credentials: true,
  }),
);

app.use('/api', router);

let server: Server;

const startServer = async () => {
  const port = appConfig.serverPort || 3000;
  // Start the server only after the database connection is established
  try {
    await connectToDatabase();
    server = app.listen(port, () => {
      console.log(`Server running http://localhost:${port}`);
    });
  } catch (error) {
    console.log('Couldnt connect to database,');
  }

  return server;
};

export { startServer };
