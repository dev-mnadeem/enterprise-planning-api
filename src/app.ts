import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express from 'express';
import { Server } from 'http';
import logger from 'morgan';

import appConfig from './config/appConfig';
import { connectToDatabase } from './database/data-source';
import { router } from './routes';

const app = express();

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy!' });
});

const corsOptions: CorsOptions = {
  origin: true, // Allow all origins
  credentials: true,
};

app.use(cors(corsOptions));
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
