import { Request, Response } from 'express';
import * as orderService from '../dal/order.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TCreateOrder, TUpdateOrder } from '../schemas/order.schema';

export const createOrder = async (req: Request<unknown, unknown, TCreateOrder>, res: Response) => {
  try {
    const orderData = req.body;

    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();

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

export const updateOrder = async (req: Request<{ id: string }, unknown, TUpdateOrder>, res: Response) => {
  try {
    const { id } = req.params;
    const orderData = req.body;

    const updatedOrder = await orderService.updateOrder(id, orderData);

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
