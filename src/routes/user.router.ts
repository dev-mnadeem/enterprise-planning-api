import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/user.controller';

const userRouter: Router = express.Router();

userRouter.post('/', expressAsyncHandler(createUser));
userRouter.get('/', expressAsyncHandler(getAllUsers));
userRouter.get('/:id', expressAsyncHandler(getUserById));
userRouter.patch('/:id', expressAsyncHandler(updateUser));
userRouter.delete('/:id', expressAsyncHandler(deleteUser));

export { userRouter };
