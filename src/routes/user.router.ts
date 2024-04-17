import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { getAllUsers } from '../controllers/user.controller';

const userRouter: Router = express.Router();

userRouter.get('/', expressAsyncHandler(getAllUsers));
export { userRouter };
