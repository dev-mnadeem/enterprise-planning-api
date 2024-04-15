import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  getAllStates,
  getStateById,
  updateState,
} from '../controllers/state.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { updateStateSchema } from '../schemas/state.schema';
import { getCitiesByStateId } from '../controllers/city.controller';

const stateRouter: Router = express.Router();

stateRouter.get('/', expressAsyncHandler(getAllStates));
stateRouter.get('/:id', expressAsyncHandler(getStateById));
stateRouter.patch('/:id', validateZodMiddleware(updateStateSchema), expressAsyncHandler(updateState));

stateRouter.get('/:state_id/cities', expressAsyncHandler(getCitiesByStateId));

export { stateRouter };
