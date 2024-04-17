import express from 'express';

import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
import { userRouter } from './user.router';

const router = express();

router.use('/users', authenticateJWT, userRouter);
export { router };
