import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createContainer,
  deleteContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
} from '../controllers/container.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { addItemsToContainerSchema, createContainerSchema, updateContainerSchema } from '../schemas/container.schema';

const containerRouter: Router = express.Router();

containerRouter.get('/', expressAsyncHandler(getAllContainers));
containerRouter.post('/', validateZodMiddleware(createContainerSchema), expressAsyncHandler(createContainer));
containerRouter.get('/:id', expressAsyncHandler(getContainerById));
containerRouter.patch('/:id', validateZodMiddleware(updateContainerSchema), expressAsyncHandler(updateContainer));
containerRouter.delete('/:id', expressAsyncHandler(deleteContainer));

export { containerRouter };
