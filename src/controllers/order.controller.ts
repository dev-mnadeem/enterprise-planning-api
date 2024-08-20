import { Request, Response } from 'express';
import * as orderService from '../dal/order.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';
import { RequestWithCurrentUser } from '../types/user.interface';
import { OrderQueryParams, queryParamToOrderParam } from '../types/order.interface';

export const createOrder = async (req: Request<unknown, unknown, TCreateOrder>, res: Response) => {
  try {
    const { id: userId } = (req as RequestWithCurrentUser).currentUser;
    const orderData = req.body;

    const newOrder = await orderService.createOrder(userId, orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const validateInOrderNumber = async (req: Request, res: Response) => {
  const { number } = req.params;

  const isValid = await orderService.validateOrderNumber(number, 'in');

  res.json(isValid);
};

export const validateOutOrderNumber = async (req: Request, res: Response) => {
  const { number } = req.params;

  const isValid = await orderService.validateOrderNumber(number, 'out');

  res.json(isValid);
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const currentUser = (req as RequestWithCurrentUser).currentUser;
    const params: OrderQueryParams = queryParamToOrderParam(req);
    const orders = await orderService.getAllOrders(currentUser, params);

    res.json(orders);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    res.json(order);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id: userId } = (req as RequestWithCurrentUser).currentUser;
    const { id } = req.params;
    const orderData: TUpdateOrder = req.body;

    const updatedOrder = await orderService.updateOrder(userId, id, orderData);

    res.json(updatedOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await orderService.deleteOrder(id);

    res.json({ message: 'Order Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
