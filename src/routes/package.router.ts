import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createPackage, deletePackage, getAllPackages, getPackageById, updatePackage } from '../controllers/package.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createPackageSchema, updatePackageSchema } from '../schemas/package.schema';

const packageRouter: Router = express.Router();

packageRouter.get('/', expressAsyncHandler(getAllPackages));
packageRouter.post('/', validateZodMiddleware(createPackageSchema), expressAsyncHandler(createPackage));
packageRouter.get('/:id', expressAsyncHandler(getPackageById));
packageRouter.patch('/:id', validateZodMiddleware(updatePackageSchema), expressAsyncHandler(updatePackage));
packageRouter.delete('/:id', expressAsyncHandler(deletePackage));

export { packageRouter };
