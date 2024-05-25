import express from 'express';

// import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
// import { authenticateRole } from '../middlewares/authenticateRoleMiddleware';
import { userRouter } from './user.router';
import userRoleRouter from './userRole.router';
import { authRouter } from './auth.router';
import { countryRouter } from './country.router';
import { cityRouter } from './city.router';
import { areaRouter } from './area.router';
import { locationRouter } from './location.router';
import { locationTypeRouter } from './locationType.router';
import { permissionRouter } from './permission.router';
import { stateRouter } from './state.router';
import { orderRouter } from './order.router';

const router = express();

router.use('/user-roles', userRoleRouter);
router.use('/users', userRouter);
router.use('/auth', authRouter);
router.use('/countries', countryRouter);
router.use('/cities', cityRouter);
router.use('/states', stateRouter);
router.use('/areas', areaRouter);
router.use('/locations', locationRouter);
router.use('/location-types', locationTypeRouter);
router.use('/permissions', permissionRouter);
router.use('/orders', orderRouter);

export { router };
