import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createPermission, getAllPermissions } from '../controllers/permission.controller';
import { createPermissionSchema } from '../schemas/permission.schema';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';

const permissionRouter: Router = express.Router();

permissionRouter.post('/', validateZodMiddleware(createPermissionSchema), expressAsyncHandler(createPermission));
permissionRouter.get('/', expressAsyncHandler(getAllPermissions));

export { permissionRouter };
