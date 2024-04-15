import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createLocation,
  deleteLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
} from '../controllers/location.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createLocationSchema, updateLocationSchema } from '../schemas/location.schema';

const locationRouter: Router = express.Router();

locationRouter.get('/', expressAsyncHandler(getAllLocations));
locationRouter.post('/', validateZodMiddleware(createLocationSchema), expressAsyncHandler(createLocation));
locationRouter.get('/:id', expressAsyncHandler(getLocationById));
locationRouter.patch('/:id', validateZodMiddleware(updateLocationSchema), expressAsyncHandler(updateLocation));
locationRouter.delete('/:id', expressAsyncHandler(deleteLocation));

export { locationRouter };
