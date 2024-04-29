import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createUserRole,
  deleteUserRole,
  getAllUserRoles,
  getUserRoleById,
  updateUserRole,
} from '../controllers/userRole.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createUserRoleSchema, updateUserRoleSchema } from '../schemas/userRole.schema';

const userRoleRouter = express.Router();

userRoleRouter.get('/', expressAsyncHandler(getAllUserRoles));
userRoleRouter.post('/', validateZodMiddleware(createUserRoleSchema), expressAsyncHandler(createUserRole));
userRoleRouter.get('/:id', expressAsyncHandler(getUserRoleById));
userRoleRouter.patch('/:id', validateZodMiddleware(updateUserRoleSchema), expressAsyncHandler(updateUserRole));
userRoleRouter.delete('/:id', expressAsyncHandler(deleteUserRole));

export default userRoleRouter;
