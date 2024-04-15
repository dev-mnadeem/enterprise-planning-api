import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
} from '../controllers/vehicle.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema';

const vehicleRouter: Router = express.Router();

vehicleRouter.get('/', expressAsyncHandler(getAllVehicles));
vehicleRouter.post('/', validateZodMiddleware(createVehicleSchema), expressAsyncHandler(createVehicle));
vehicleRouter.get('/:id', expressAsyncHandler(getVehicleById));
vehicleRouter.patch('/:id', validateZodMiddleware(updateVehicleSchema), expressAsyncHandler(updateVehicle));
vehicleRouter.delete('/:id', expressAsyncHandler(deleteVehicle));

export { vehicleRouter };
