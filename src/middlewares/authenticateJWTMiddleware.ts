import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import appConfig from '../config/appConfig';
import { extractTokenWithBearerPrefix } from '../utils/extractTokenWithBearerPrefix';
import { User } from '../entities';
import { AppDataSource } from '../database/data-source';
import { FindOneOptions } from 'typeorm';
import { RequestWithCurrentUser } from '../types/user.interface';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const { authorization: authToken } = req.headers;

  if (authToken) {
    const token = extractTokenWithBearerPrefix(authToken);

    jwt.verify(token, appConfig.jwtSecretKey!, async (err: any, decoded: string | JwtPayload | undefined) => {      
      if (err) {
        return res.status(403).json({ message: "You're not authorized to perform this action!" });
      } else {
        if (decoded && typeof decoded !== 'string') {
          const userRepository = AppDataSource.getRepository(User);

          const options: FindOneOptions<User> = {
            where: { email: JSON.parse(decoded.id).email },
          };

          const user = await userRepository.findOne(options);
          (req as RequestWithCurrentUser).currentUser = user;
        }
        next();
      }
    });
  } else {
    res.status(401).json({ message: "You're not authorized to perform this action!" });
  }
};
