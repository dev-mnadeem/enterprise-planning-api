import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { login, handleRefreshToken } from '../controllers/auth.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { loginSchema } from '../schemas/user.schema';

const authRouter: Router = express.Router({ mergeParams: true });

authRouter.post('/fake-login', validateZodMiddleware(loginSchema), expressAsyncHandler(login));
authRouter.get('/refresh', expressAsyncHandler(handleRefreshToken));

export { authRouter };
