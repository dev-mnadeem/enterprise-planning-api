import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createParcel,
  deleteParcel,
  getAllParcels,
  getParcelById,
  // updateParcel,
  validateInParcelNumber,
  validateOutParcelNumber,
} from '../controllers/parcel.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { parcelHistoryRouter } from './parcelHistory.router';
import { parcelsInSchema, parcelsOutSchema } from '../schemas/parcelHistory.schema';
import { parcelsIn, parcelsOut } from '../controllers/parcelHistory.controller';
import { parcelSchema } from '../schemas/parcel.schema';

const parcelRouter: Router = express.Router();

parcelRouter.get('/', expressAsyncHandler(getAllParcels));
parcelRouter.post('/', validateZodMiddleware(parcelSchema), expressAsyncHandler(createParcel));
parcelRouter.get('/:id', expressAsyncHandler(getParcelById));
// parcelRouter.patch('/:id', validateZodMiddleware(parcelSchema), expressAsyncHandler(updateParcel));
parcelRouter.delete('/:id', expressAsyncHandler(deleteParcel));

parcelRouter.get('/:number/in/is-valid', expressAsyncHandler(validateInParcelNumber));
parcelRouter.get('/:number/out/is-valid', expressAsyncHandler(validateOutParcelNumber));
parcelRouter.post('/in', validateZodMiddleware(parcelsInSchema), expressAsyncHandler(parcelsIn));
parcelRouter.post('/out', validateZodMiddleware(parcelsOutSchema), expressAsyncHandler(parcelsOut));

parcelRouter.use('/:id', parcelHistoryRouter);

export { parcelRouter };
