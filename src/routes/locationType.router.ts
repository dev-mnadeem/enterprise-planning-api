import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllLocationTypes } from '../controllers/locationType.controller';

const locationTypeRouter: Router = express.Router();

locationTypeRouter.get('/', expressAsyncHandler(getAllLocationTypes));

export { locationTypeRouter };
