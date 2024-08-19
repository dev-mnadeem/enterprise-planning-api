import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrder, validateOrderNumber } from '../controllers/order.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createOrderSchema, updateOrderSchema } from '../schemas/order.schema';
import { authenticateJWT } from '../middlewares/authenticateJWTMiddleware';
import { orderHistoryRouter } from './orderHistory.router';
import { ordersInSchema, ordersOutSchema } from '../schemas/orderHistory.schema';
import { ordersIn, ordersOut } from '../controllers/orderHistory.controller';

const orderRouter: Router = express.Router();

orderRouter.get('/', expressAsyncHandler(getAllOrders));
orderRouter.post('/', authenticateJWT ,validateZodMiddleware(createOrderSchema), expressAsyncHandler(createOrder));
orderRouter.get('/:id', expressAsyncHandler(getOrderById));
orderRouter.patch('/:id', authenticateJWT, validateZodMiddleware(updateOrderSchema), expressAsyncHandler(updateOrder));
orderRouter.delete('/:id', expressAsyncHandler(deleteOrder));

orderRouter.get('/:number/is-valid', expressAsyncHandler(validateOrderNumber));
orderRouter.post('/in', authenticateJWT ,validateZodMiddleware(ordersInSchema), expressAsyncHandler(ordersIn));
orderRouter.post('/out', authenticateJWT ,validateZodMiddleware(ordersOutSchema), expressAsyncHandler(ordersOut));

orderRouter.use('/:id', orderHistoryRouter);

export { orderRouter };
