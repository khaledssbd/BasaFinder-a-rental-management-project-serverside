import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import tryCatchAsync from '../../utils/tryCatchAsync';

export const createToken = (
  jwtPayload: {
    email: string;
    name: string;
    image: string;
    role: string;
  },
  secret: string,
  expiresIn: string,
) => {
  // return jwt.sign(jwtPayload, secret, { expiresIn: Number(expiresIn) }); // for @types/jsonwebtoken@9.0.8
  // return jwt.sign(jwtPayload, secret, {
  //   expiresIn: parseInt(expiresIn),  // for @types/jsonwebtoken@9.0.8
  // });

  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (token: string, secret: string) => {
  let decoded;

  try {
    decoded = jwt.verify(token, secret) as JwtPayload;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized!');
  }

  return decoded;
};

// rate limiting middleware --------------------------------------------------------------------

type Ratelimit = {
  max: number;
  minutes: number;
  message: string;
};

const rateLimitStorage = new Map<string, { count: number; expiry: number }>();

export const rateLimit = (option: Ratelimit) => {
  return tryCatchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const ip =
        (req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      const currentTime = Date.now();
      const record = rateLimitStorage.get(ip);

      if (!record || record.expiry < currentTime) {
        // Reset the rate limit if expired
        rateLimitStorage.set(ip, {
          count: 1,
          expiry: currentTime + option.minutes * 60 * 1000,
        });
      } else {
        record.count++;
        if (record.count > option.max) {
          throw new AppError(StatusCodes.TOO_MANY_REQUESTS, option.message);
        }
        // Update the record
        rateLimitStorage.set(ip, record);
      }

      next();
    },
  );
};

export const argsForLogin = {
  max: 8,
  minutes: 5,
  message: 'Too many requests, please try again later!',
};

export const argsForForgotPassword = {
  max: 2,
  minutes: 5,
  message: 'Already mailed, please check it!',
};
