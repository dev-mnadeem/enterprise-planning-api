import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllVehicleTypes } from '../controllers/vehicleType.controller';

const vehicleTypeRouter: Router = express.Router();

vehicleTypeRouter.get('/', expressAsyncHandler(getAllVehicleTypes));

export { vehicleTypeRouter };
