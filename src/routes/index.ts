import express from 'express';

// import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
// import { authenticateRole } from '../middlewares/authenticateRoleMiddleware';
import { userRouter } from './user.router';
import userRoleRouter from './userRole.router';

const router = express();

router.use('/users', userRouter);
router.use('/user-roles', userRoleRouter);

export { router };
