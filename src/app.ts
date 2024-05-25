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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Server is healthy!' });
});

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    callback(null, true); // Allow all origins
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
