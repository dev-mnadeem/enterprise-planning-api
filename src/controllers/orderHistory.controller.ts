import { Request, Response } from 'express';
import * as orderHistoryService from '../dal/orderHistory.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TOrderIn, TOrderOut } from '../schemas/orderHistory.schema';

export const orderIn = async (req: Request<{ id: string }, unknown, TOrderIn>, res: Response) => {
  try {
    const { id } = req.params;
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderIn(id, orderHistoryData);
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const orderOut = async (req: Request<{ id: string }, unknown, TOrderOut>, res: Response) => {
  try {
    const { id } = req.params;
    const orderHistoryData = req.body;

    const newOrder = await orderHistoryService.orderOut(id, orderHistoryData);
    res.status(200).json(newOrder);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
