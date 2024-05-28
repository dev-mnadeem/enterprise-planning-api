import express, { Router } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createOrder, deleteOrder, getAllOrders, getOrderById, updateOrder } from '../controllers/order.controller';
import { validateZodMiddleware } from '../middlewares/validateMiddleware';
import { createOrderSchema, updateOrderSchema } from '../schemas/order.schema';

const orderRouter: Router = express.Router();

orderRouter.get('/', expressAsyncHandler(getAllOrders));
orderRouter.post('/', validateZodMiddleware(createOrderSchema), expressAsyncHandler(createOrder));
orderRouter.get('/:id', expressAsyncHandler(getOrderById));
orderRouter.patch('/:id', validateZodMiddleware(updateOrderSchema), expressAsyncHandler(updateOrder));
orderRouter.delete('/:id', expressAsyncHandler(deleteOrder));

export { orderRouter };
