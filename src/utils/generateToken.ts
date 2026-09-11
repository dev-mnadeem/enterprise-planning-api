import { sign } from 'jsonwebtoken';
import appConfig from '../config/appConfig';
import { User } from '../entities';

// Neither token carried an `exp` claim, so every token ever issued stayed valid
// for good. A token pulled from a log or a browser's storage was a permanent
// credential that revoking the user's password did nothing about.
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '1d'; // matches the refresh cookie's maxAge

export const generateAccessToken = (user: Partial<User>) =>
  sign({ id: JSON.stringify(user) }, `${appConfig.jwtSecretKey}`, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

export const generateRefreshToken = (user: Partial<User>) =>
  sign({ id: JSON.stringify(user) }, `${appConfig.refreshTokenSecretKey}`, {
    expiresIn: REFRESH_TOKEN_TTL,
  });
