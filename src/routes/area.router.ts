import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createArea, deleteArea, getAllAreas, getAreaById, updateArea } from '../controllers/area.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createAreaSchema, updateAreaSchema } from '../schemas/area.schema';

const areaRouter: Router = express.Router();

areaRouter.get('/', expressAsyncHandler(getAllAreas));
areaRouter.post('/', validateZodMiddleware(createAreaSchema), expressAsyncHandler(createArea));
areaRouter.get('/:id', expressAsyncHandler(getAreaById));
areaRouter.patch('/:id', validateZodMiddleware(updateAreaSchema), expressAsyncHandler(updateArea));
areaRouter.delete('/:id', expressAsyncHandler(deleteArea));

export { areaRouter };
