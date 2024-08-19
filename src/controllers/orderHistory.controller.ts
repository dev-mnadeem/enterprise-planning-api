import { Request, Response } from 'express';
import * as orderHistoryService from '../dal/orderHistory.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TOrderIn, TOrderOut, TOrdersIn, TOrdersOut } from '../schemas/orderHistory.schema';

export const orderIn = async (req: Request<{ id: string }, unknown, TOrderIn>, res: Response) => {
  try {
    const { id } = req.params;
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderIn({ ...orderHistoryData, order_numbers: [id] });
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const ordersIn = async (req: Request<unknown, unknown, TOrdersIn>, res: Response) => {
  try {
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderIn(orderHistoryData);
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const orderOut = async (req: Request<{ id: string }, unknown, TOrderOut>, res: Response) => {
  try {
    const { id } = req.params;
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderOut({ ...orderHistoryData, order_numbers: [id] });
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const ordersOut = async (req: Request<unknown, unknown, TOrdersOut>, res: Response) => {
  try {
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderOut(orderHistoryData);
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
