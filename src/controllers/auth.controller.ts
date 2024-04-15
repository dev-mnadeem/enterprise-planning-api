import { CookieOptions, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import * as userService from '../dal/user.dal';
import * as userRoleService from '../dal/userRole.dal';
import appConfig from '../config/appConfig';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { CustomError } from '../utils/customError';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { TLogin, TSignUpUser } from '../schemas/user.schema';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';
import { TPermission } from '../schemas/permission.schema';

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 24 * 60 * 60 * 1000,
};

// One message for an unknown account and a wrong password, so the login form
// cannot be used to find out which emails and phone numbers are registered.
const INVALID_CREDENTIALS = 'Invalid credentials!';
const ACCOUNT_DISABLED = 'This account has been disabled.';

const readTokenUserId = (payload: string | jwt.JwtPayload): string | undefined => {
  if (typeof payload === 'string') return undefined;
  try {
    return JSON.parse(payload.id).id;
  } catch {
    return undefined;
  }
};

export const login = async (req: Request<unknown, unknown, TLogin>, res: Response) => {
  try {
    const { email, phone_number, password } = req.body;

    const currentUser = email
      ? await userService.getUserByEmail(email.toLowerCase())
      : await userService.getUserByPhone(phone_number!);

    if (!currentUser || !(await verifyPassword(password, currentUser.password))) {
      throw new CustomError(INVALID_CREDENTIALS, 401);
    }

    if (!currentUser.status) {
      throw new CustomError(ACCOUNT_DISABLED, 403);
    }

    const { password: _password, refresh_token: _refreshToken, permissions, locations, ...user } = currentUser;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.updateUser(user.id, { refresh_token: refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ token: accessToken, permissions, locations });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const signup = async (req: Request<unknown, unknown, TSignUpUser>, res: Response) => {
  try {
    const { name, email, password, phone_number } = req.body;

    const encryptedPassword = await hashPassword(password);
    const customerUserRole = await userRoleService.getUserRoleByName('customer');

    const user = await userService.createUser({
      name,
      email,
      password: encryptedPassword,
      phone_number,
      role_id: customerUserRole.id,
      permissions: customerUserRole.permissions as TPermission[],
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.updateUser(user.id, { refresh_token: refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ token: accessToken });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const handleRefreshToken = async (req: Request<unknown, unknown>, res: Response) => {
  try {
    const presented: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (!presented) {
      throw new CustomError('You are not authorized!', 401);
    }

    const user = await userService.getUserByRefreshToken(presented);

    if (!user) {
      throw new CustomError('You are not authorized!', 401);
    }

    // Verified synchronously: the old callback form threw inside an async
    // callback, so a bad token left the request hanging.
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(presented, `${appConfig.refreshTokenSecretKey}`);
    } catch {
      throw new CustomError('You are not authorized!', 403);
    }

    if (readTokenUserId(payload) !== user.id) {
      throw new CustomError('You are not authorized!', 403);
    }

    if (!user.status) {
      throw new CustomError(ACCOUNT_DISABLED, 403);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.updateUser(user.id, { refresh_token: refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ token: accessToken });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
