import { Response } from 'express';
import { EntityMetadataNotFoundError, EntityNotFoundError, QueryFailedError } from 'typeorm';
import { CustomError } from './customError';
import appConfig from '../config/appConfig';
import { Environment } from '../types/environments';

const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_INVALID_TEXT_REPRESENTATION = '22P02';

const describeQueryFailure = (error: QueryFailedError): { status: number; message: string } => {
  const code = (error.driverError as { code?: string } | undefined)?.code;

  switch (code) {
    case PG_UNIQUE_VIOLATION:
      return { status: 409, message: 'A record with these details already exists.' };
    case PG_FOREIGN_KEY_VIOLATION:
      return { status: 422, message: 'A referenced record does not exist or is still in use.' };
    case PG_INVALID_TEXT_REPRESENTATION:
      return { status: 422, message: 'One of the values has the wrong format.' };
    default:
      // Raw driver messages name tables and constraints; keep them in the log.
      return { status: 422, message: 'The request could not be applied to the database.' };
  }
};

export const sendErrorResponse = (error: Error, res: Response) => {
  if (appConfig.environment == Environment.local) {
    console.log(error);
  }

  if (error instanceof CustomError) {
    res.status(error.statusCode).json({ message: error.message });
  } else if (error instanceof QueryFailedError) {
    const { status, message } = describeQueryFailure(error);
    res.status(status).json({ message });
  } else if (error instanceof EntityNotFoundError) {
    res.status(404).json({ message: 'Record Not Found' });
  } else if (error instanceof EntityMetadataNotFoundError) {
    res.status(404).json({ message: 'EntityMetadata Not Found' });
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
