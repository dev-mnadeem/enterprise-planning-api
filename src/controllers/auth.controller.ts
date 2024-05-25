import { Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import * as userService from '../dal/user.dal';
import * as userRoleService from '../dal/userRole.dal';
import appConfig from '../config/appConfig';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { CustomError } from '../utils/customError';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { TLogin, TSignUpUser } from '../schemas/user.schema';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';

export const login = async (req: Request<unknown, unknown, TLogin>, res: Response) => {
  try {
    const { email, password } = req.body;
    const currentUser = await userService.getUserByEmail(email);

    if (!currentUser) {
      throw new CustomError('Invalid email!', 401);
    }

    const { password: userPassword, refresh_token , ...user } = currentUser;

    const isPassordInValid = await verifyPassword(password, userPassword);

    if (!isPassordInValid) {
      throw new CustomError('Invalid password!', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.updateUser(user.id, { refresh_token: refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: accessToken });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const signup = async (req: Request<unknown, unknown, TSignUpUser>, res: Response) => {
  try {
    const { name, email, password, phone_number } = req.body;

    const encryptedPassword = await hashPassword(password);
    const customerUserRole = await userRoleService.getUserRoleByName('customer');

    const createdUser = await userService.createUser({
      name,
      email,
      password: encryptedPassword,
      phone_number,
      role_id: customerUserRole?.id,
      permissions: customerUserRole?.permissions,
    });

    if (!createdUser) {
      throw new CustomError('Unable to signup', 401);
    }

    const { password: userPassword, refresh_token , ...user } = createdUser;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await userService.updateUser(user.id, { refresh_token: refreshToken });

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token: accessToken });
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};

export const handleRefreshToken = async (req: Request<unknown, unknown>, res: Response) => {
  try {
    const cookies = req.cookies;

    if (!cookies || !cookies[REFRESH_TOKEN_COOKIE_NAME]) {
      throw new CustomError('You are not authorized!', 401);
    }

    const user = await userService.getUserByRefreshToken(cookies[REFRESH_TOKEN_COOKIE_NAME]);

    if (!user) {
      throw new CustomError('You are not authorized!', 401);
    }

    jwt.verify(
      cookies[REFRESH_TOKEN_COOKIE_NAME],
      `${appConfig.refreshTokenSecretKey}`,
      async (err: VerifyErrors | null, decoded: any) => {
        if (err || user.email !== JSON.parse(decoded.id).email) {
          return res.sendStatus(403);
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await userService.updateUser(user.id, { refresh_token: refreshToken });

        res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({ token: accessToken });
      },
    );
  } catch (error) {
    sendErrorResponse(error as Error, res);
  }
};
