import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import appConfig from '../config/appConfig';
import { extractTokenWithBearerPrefix } from '../utils/extractTokenWithBearerPrefix';
import { User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { FindOneOptions } from 'typeorm';
import { RequestWithCurrentUser } from '../types/user.interface';

const UNAUTHORIZED = "You're not authorized to perform this action!";

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  const { authorization: authToken } = req.headers;

  if (!authToken) {
    return res.status(401).json({ message: UNAUTHORIZED });
  }

  let decoded: JwtPayload;
  try {
    const token = extractTokenWithBearerPrefix(authToken);
    const verified = jwt.verify(token, appConfig.jwtSecretKey!);
    if (typeof verified === 'string') {
      return res.status(403).json({ message: UNAUTHORIZED });
    }
    decoded = verified;
  } catch {
    // Covers an expired token, a bad signature and a malformed header alike.
    return res.status(403).json({ message: UNAUTHORIZED });
  }

  let phoneNumber: string;
  try {
    phoneNumber = JSON.parse(decoded.id).phone_number;
  } catch {
    // The previous version called JSON.parse inside an async callback with no
    // handler, so a token whose payload was not JSON produced an unhandled
    // rejection and the request hung until it timed out.
    return res.status(403).json({ message: UNAUTHORIZED });
  }

  if (!phoneNumber) {
    return res.status(403).json({ message: UNAUTHORIZED });
  }

  try {
    const userRepository = AppDataSource.getRepository(User);

    const options: FindOneOptions<User> = {
      where: { phone_number: phoneNumber },
      relations: {
        // user_role is what authenticateRole reads. It was missing here, so the
        // role check threw on `undefined.name` the moment it was switched on.
        user_role: true,
        locations: { city: { state: { country: true } } },
      },
    };

    const user = await userRepository.findOne(options);

    if (!user) {
      return res.status(404).json({ message: 'User Not Found!' });
    }

    (req as RequestWithCurrentUser).currentUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
