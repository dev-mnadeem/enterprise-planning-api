import express from 'express';

import { authenticateRole, denyRoles } from '../middlewares/authenticateRoleMiddleware';
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
import { parcelRouter } from './parcel.router';

const router = express.Router();

// Anyone can sign up as a customer, and the permission flags on each user are
// only checked by the frontend. Without this gate a fresh signup could edit
// prices, delete vehicles or move stock through the API directly.
const staff = [authenticateJWT, denyRoles('customer')];

router.use('/user-roles', authenticateJWT, authenticateRole('admin'), userRoleRouter);
router.use('/users', authenticateJWT, userRouter);
router.use('/auth', authRouter);
router.use('/countries', staff, countryRouter);
router.use('/cities', staff, cityRouter);
router.use('/states', staff, stateRouter);
router.use('/areas', staff, areaRouter);
router.use('/locations', staff, locationRouter);
router.use('/location-types', staff, locationTypeRouter);
router.use('/permissions', authenticateJWT, authenticateRole('admin'), permissionRouter);
router.use('/orders', staff, orderRouter);
router.use('/packages', staff, packageRouter);
router.use('/pricings', staff, pricingRouter);
router.use('/vehicles', staff, vehicleRouter);
router.use('/vehicle-types', staff, vehicleTypeRouter);
router.use('/containers', staff, containerRouter);
router.use('/parcels', staff, parcelRouter);

export { router };
