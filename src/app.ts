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

app.use(cors());

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
