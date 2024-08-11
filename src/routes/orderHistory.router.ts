import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
import { orderIn, orderOut } from '../controllers/orderHistory.controller';
import { orderInSchema, orderOutSchema } from '../schemas/orderHistory.schema';

const orderHistoryRouter: Router = express.Router({ mergeParams: true });

orderHistoryRouter.patch('/in', authenticateJWT ,validateZodMiddleware(orderInSchema), expressAsyncHandler(orderIn));
orderHistoryRouter.patch('/out', authenticateJWT ,validateZodMiddleware(orderOutSchema), expressAsyncHandler(orderOut));

export { orderHistoryRouter };
