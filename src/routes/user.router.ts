import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createUserSchema, updateUserSchema } from '../schemas/user.schema';

const userRouter: Router = express.Router();

userRouter.get('/', expressAsyncHandler(getAllUsers));
userRouter.post('/', validateZodMiddleware(createUserSchema), expressAsyncHandler(createUser));
userRouter.get('/:id', expressAsyncHandler(getUserById));
userRouter.patch('/:id', validateZodMiddleware(updateUserSchema), expressAsyncHandler(updateUser));
userRouter.delete('/:id', expressAsyncHandler(deleteUser));

export { userRouter };
