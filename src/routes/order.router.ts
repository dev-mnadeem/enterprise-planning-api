import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  validateInOrderNumber,
  validateOutOrderNumber,
} from '../controllers/order.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createOrderSchema, updateOrderSchema } from '../schemas/order.schema';
import { orderHistoryRouter } from './orderHistory.router';
import { ordersInSchema, ordersOutSchema } from '../schemas/orderHistory.schema';
import { ordersIn, ordersOut } from '../controllers/orderHistory.controller';

const orderRouter: Router = express.Router();

orderRouter.get('/', expressAsyncHandler(getAllOrders));
orderRouter.post('/', validateZodMiddleware(createOrderSchema), expressAsyncHandler(createOrder));
orderRouter.get('/:id', expressAsyncHandler(getOrderById));
orderRouter.patch('/:id', validateZodMiddleware(updateOrderSchema), expressAsyncHandler(updateOrder));
orderRouter.delete('/:id', expressAsyncHandler(deleteOrder));

orderRouter.get('/:number/in/is-valid', expressAsyncHandler(validateInOrderNumber));
orderRouter.get('/:number/out/is-valid', expressAsyncHandler(validateOutOrderNumber));
orderRouter.post('/in', validateZodMiddleware(ordersInSchema), expressAsyncHandler(ordersIn));
orderRouter.post('/out', validateZodMiddleware(ordersOutSchema), expressAsyncHandler(ordersOut));

orderRouter.use('/:id', orderHistoryRouter);

export { orderRouter };
