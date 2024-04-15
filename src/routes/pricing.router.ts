import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createPricing,
  deletePricing,
  getAllPricings,
  getPricingById,
  updatePricing,
} from '../controllers/pricing.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createPricingSchema, updatePricingSchema } from '../schemas/pricing.schema';

const pricingRouter: Router = express.Router();

pricingRouter.get('/', expressAsyncHandler(getAllPricings));
pricingRouter.post('/', validateZodMiddleware(createPricingSchema), expressAsyncHandler(createPricing));
pricingRouter.get('/:id', expressAsyncHandler(getPricingById));
pricingRouter.patch('/:id', validateZodMiddleware(updatePricingSchema), expressAsyncHandler(updatePricing));
pricingRouter.delete('/:id', expressAsyncHandler(deletePricing));

export { pricingRouter };
