import express from 'express';

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
import { packageRouter } from './package.router';
import { pricingRouter } from './pricing.router';
import { vehicleRouter } from './vehicle.router';
import { vehicleTypeRouter } from './vehicleType.router';
import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
import { containerRouter } from './container.router';

const router = express();

router.use('/user-roles', authenticateJWT, userRoleRouter);
router.use('/users', authenticateJWT, userRouter);
router.use('/auth', authRouter);
router.use('/countries', authenticateJWT, countryRouter);
router.use('/cities', authenticateJWT, cityRouter);
router.use('/states', authenticateJWT, stateRouter);
router.use('/areas', authenticateJWT, areaRouter);
router.use('/locations', authenticateJWT, locationRouter);
router.use('/location-types', authenticateJWT, locationTypeRouter);
router.use('/permissions', authenticateJWT, permissionRouter);
router.use('/orders', authenticateJWT, orderRouter);
router.use('/packages', authenticateJWT, packageRouter);
router.use('/pricings', authenticateJWT, pricingRouter);
router.use('/vehicles', authenticateJWT, vehicleRouter);
router.use('/vehicle-types', authenticateJWT, vehicleTypeRouter);
router.use('/containers', authenticateJWT, containerRouter);

export { router };
