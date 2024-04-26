import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { login, handleRefreshToken, signup } from '../controllers/auth.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createUserSchema, loginSchema } from '../schemas/user.schema';

const authRouter: Router = express.Router({ mergeParams: true });

authRouter.post('/login', validateZodMiddleware(loginSchema), expressAsyncHandler(login));
authRouter.post('/signup', validateZodMiddleware(createUserSchema), expressAsyncHandler(signup));
authRouter.get('/refresh', expressAsyncHandler(handleRefreshToken));

export { authRouter };
