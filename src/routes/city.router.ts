import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createCity, deleteCity, getAllCities, getCityById, updateCity } from '../controllers/city.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createCitySchema, updateCitySchema } from '../schemas/city.schema';

const cityRouter: Router = express.Router();

cityRouter.get('/', expressAsyncHandler(getAllCities));
cityRouter.post('/', validateZodMiddleware(createCitySchema), expressAsyncHandler(createCity));
cityRouter.get('/:id', expressAsyncHandler(getCityById));
cityRouter.patch('/:id', validateZodMiddleware(updateCitySchema), expressAsyncHandler(updateCity));
cityRouter.delete('/:id', expressAsyncHandler(deleteCity));

export { cityRouter };
