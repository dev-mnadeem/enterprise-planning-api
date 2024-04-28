import express from 'express';

// import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
// import { authenticateRole } from '../middlewares/authenticateRoleMiddleware';
import { userRouter } from './user.router';
import userRoleRouter from './userRole.router';
import { authRouter } from './auth.router';
import { countryRouter } from './country.router';
import { cityRouter } from './city.router';
import { areaRouter } from './area.router';

const router = express();

router.use('/user-roles', userRoleRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/countries', countryRouter);
router.use('/cities', cityRouter);
router.use('/areas', areaRouter);

export { router };
