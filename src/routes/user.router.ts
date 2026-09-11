import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import {
  authenticateRole,
  authenticateRoleOrSelf,
} from '../middlewares/authenticateRoleMiddleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const userRouter: Router = express.Router();

// Listing, creating and deleting users are staff operations. Reading and
// editing a single record is also allowed to the person it belongs to.
// Before this, a self-registered customer could enumerate every user and
// delete the administrator.
userRouter.get('/', authenticateRole('admin', 'manager'), expressAsyncHandler(getAllUsers));
userRouter.post(
  '/',
  authenticateRole('admin', 'manager'),
  validateZodMiddleware(createUserSchema),
  expressAsyncHandler(createUser),
);
userRouter.get('/:id', authenticateRoleOrSelf('admin', 'manager'), expressAsyncHandler(getUserById));
userRouter.patch(
  '/:id',
  authenticateRoleOrSelf('admin', 'manager'),
  validateZodMiddleware(updateUserSchema),
  expressAsyncHandler(updateUser),
);
userRouter.delete('/:id', authenticateRole('admin'), expressAsyncHandler(deleteUser));

export { userRouter };
