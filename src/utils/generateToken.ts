import { sign } from 'jsonwebtoken';
import appConfig from '../config/appConfig';
import { User } from '../entities';

export const generateAccessToken = (user: Partial<User>) => {
  return sign({ id: JSON.stringify(user) }, `${appConfig.jwtSecretKey}`);
}
export const generateRefreshToken = (user: Partial<User>) =>
  sign({ id: JSON.stringify(user) }, `${appConfig.refreshTokenSecretKey}`);
