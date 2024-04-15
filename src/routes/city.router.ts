import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllCities, getCityById, updateCity } from '../controllers/city.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { updateCitySchema } from '../schemas/city.schema';

const cityRouter: Router = express.Router();

cityRouter.get('/', expressAsyncHandler(getAllCities));
cityRouter.get('/:id', expressAsyncHandler(getCityById));
cityRouter.patch('/:id', validateZodMiddleware(updateCitySchema), expressAsyncHandler(updateCity));

export { cityRouter };
