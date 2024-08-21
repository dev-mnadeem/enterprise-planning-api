import { Request, Response } from 'express';
import * as containerService from '../dal/container.dal';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { TAddItemsToContainer, TCreateContainer, TUpdateContainer } from '../schemas/container.schema';

export const createContainer = async (req: Request<unknown, unknown, TCreateContainer>, res: Response) => {
  try {
    const containerData = req.body;
    const newContainer = await containerService.createContainer(containerData);
    res.status(201).json(newContainer);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const addItemsToContainer = async (
  req: Request<{ id: string }, unknown, TAddItemsToContainer>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { order_numbers } = req.body;
    const container = await containerService.addItemsToContainer(id, order_numbers);
    res.status(201).json(container);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getAllContainers = async (req: Request, res: Response) => {
  try {
    const containers = await containerService.getAllContainers();

    res.json(containers);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const getContainerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const container = await containerService.getContainerById(id);

    res.json(container);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const updateContainer = async (req: Request<{ id: string }, unknown, TUpdateContainer>, res: Response) => {
  try {
    const { id } = req.params;
    const containerData = req.body;

    const updatedContainer = await containerService.updateContainer(id, containerData);

    res.json(updatedContainer);
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const deleteContainer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await containerService.deleteContainer(id);

    res.json({ message: 'Container Deleted Successfully!' });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
