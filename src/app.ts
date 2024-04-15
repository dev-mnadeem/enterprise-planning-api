import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { Server } from 'http';

import appConfig from './config/appConfig';
import { connectToDatabase } from './database/data-source';
import { router } from './routes';
import { sendErrorResponse } from './utils/sendErrorResponse';

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

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` });
});

// Express's default handler answers with an HTML page, which the frontend
// cannot parse. Errors that escape a controller (and body-parser failures)
// end up here instead.
app.use((error: Error & { type?: string }, req: Request, res: Response, _next: NextFunction) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }
  return sendErrorResponse(error, res);
});

const startServer = async (): Promise<Server> => {
  const port = appConfig.serverPort || 3000;
  // Listen only once the database is reachable; connectToDatabase rethrows.
  await connectToDatabase();
  return app.listen(port, () => {
    console.log(`Server running http://localhost:${port}`);
  });
};

export { app, startServer };
