import { Response } from 'express';
import { EntityMetadataNotFoundError, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { CustomError } from './customError';
import appConfig from '../config/appConfig';
import { Environment } from '../types/environments';

export const sendErrorResponse = (error: Error, res: Response) => {
  if (appConfig.environment == Environment.local) {
    console.log(error);
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof QueryFailedError) {
    res.status(422).json({ message: error.message });
  } else if (error instanceof EntityNotFoundError) {
    res.status(404).json({ message: 'Record Not Found', error });
  } else if (error instanceof EntityMetadataNotFoundError) {
    res.status(404).json({ message: 'EntityMetadata Not Found', error });
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
