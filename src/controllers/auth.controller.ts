import { Request, Response } from 'express';
import jwt, { VerifyErrors } from 'jsonwebtoken';

import * as userService from '../dal/user.dal';
import appConfig from '../config/appConfig';
import { sendErrorResponse } from '../utils/sendErrorResponse';
import { CustomError } from '../utils/customError';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import { TCreateUser, TLogin } from '../schemas/user.schema';
import { REFRESH_TOKEN_COOKIE_NAME } from '../constants';
import { hashPassword, verifyPassword } from '../utils/passwordUtils';

export const login = async (req: Request<unknown, unknown, TLogin>, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new CustomError('Invalid email!', 401);
    }

    const isPassordValid = verifyPassword(password, user.password);

    if (!isPassordValid) {
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

export const signup = async (req: Request<unknown, unknown, TCreateUser>, res: Response) => {
  try {
    const { username, email, password, branch, phone_number, mobile_number, role_id, area_id } = req.body;

    const encryptedPassword = await hashPassword(password);

    const createdUser = await userService.createUser({
      username,
      email,
      password: encryptedPassword,
      branch,
      phone_number,
      mobile_number,
      role_id,
      area_id
    });

    if (!createdUser) {
      throw new CustomError('Unable to signup', 401);
    }

    const accessToken = generateAccessToken(createdUser);
    const refreshToken = generateRefreshToken(createdUser);

    await userService.updateUser(createdUser.id, { refresh_token: refreshToken });

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
        if (err || user.email !== decoded.id) {
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
