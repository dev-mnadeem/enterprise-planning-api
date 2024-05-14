import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllPermissions } from '../controllers/permission.controller';

const permissionRouter: Router = express.Router();

permissionRouter.get('/', expressAsyncHandler(getAllPermissions));

export { permissionRouter };
