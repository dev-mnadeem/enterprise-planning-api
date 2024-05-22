import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllCountries, getCountryById, updateCountry } from '../controllers/country.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { updateCountrySchema } from '../schemas/country.schema';
import { getStatesByCountryId } from '../controllers/state.controller';

const countryRouter: Router = express.Router();

countryRouter.get('/', expressAsyncHandler(getAllCountries));
countryRouter.get('/:id', expressAsyncHandler(getCountryById));
countryRouter.patch('/:id', validateZodMiddleware(updateCountrySchema), expressAsyncHandler(updateCountry));

countryRouter.get('/:country_id/states', expressAsyncHandler(getStatesByCountryId));

export { countryRouter };
