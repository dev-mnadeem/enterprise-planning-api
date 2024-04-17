import { sign } from 'jsonwebtoken';
import appConfig from '../config/appConfig';

export const generateAccessToken = (email: string) =>
  sign({ id: email }, `${appConfig.jwtSecretKey}`, { expiresIn: '2h' });
export const generateRefreshToken = (email: string) =>
  sign({ id: email }, `${appConfig.refreshTokenSecretKey}`, { expiresIn: '1d' });
