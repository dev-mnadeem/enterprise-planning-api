import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createCountry,
  deleteCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
} from '../controllers/country.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createCountrySchema, updateCountrySchema } from '../schemas/country.schema';

const countryRouter: Router = express.Router();

countryRouter.get('/', expressAsyncHandler(getAllCountries));
countryRouter.post('/', validateZodMiddleware(createCountrySchema), expressAsyncHandler(createCountry));
countryRouter.get('/:id', expressAsyncHandler(getCountryById));
countryRouter.patch('/:id', validateZodMiddleware(updateCountrySchema), expressAsyncHandler(updateCountry));
countryRouter.delete('/:id', expressAsyncHandler(deleteCountry));

export { countryRouter };
