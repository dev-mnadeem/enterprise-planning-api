import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { parcelIn, parcelOut } from '../controllers/parcelHistory.controller';
import { parcelInSchema, parcelOutSchema } from '../schemas/parcelHistory.schema';

const parcelHistoryRouter: Router = express.Router({ mergeParams: true });

parcelHistoryRouter.post('/in', validateZodMiddleware(parcelInSchema), expressAsyncHandler(parcelIn));
parcelHistoryRouter.patch('/out', validateZodMiddleware(parcelOutSchema), expressAsyncHandler(parcelOut));

export { parcelHistoryRouter };
