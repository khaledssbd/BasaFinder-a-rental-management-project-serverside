import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload  } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import tryCatchAsync from '../utils/tryCatchAsync';
import { verifyToken } from '../modules/Auth/auth.utils';
import { User } from '../modules/user/user.model';
import { TUserRole } from '../modules/user/user.interface';

const auth = (...requiredRoles: TUserRole[]) => {
  return tryCatchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.headers.authorization;
      // checking if the token is missing
      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
      }

      // checking if the given token is expired or valid
      const decoded = verifyToken(
        token,
        config.jwt.jwt_access_secret as string,
      );

      const { role, email, iat } = decoded;

      // checking if the user is exist
      const user = await User.isUserExistsByEmail(email);
      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
      }

      // checking if the user is already deleted
      const isDeleted = user?.isDeleted;
      if (isDeleted) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Your account is deleted!');
      }

      // checking if the user is blocked
      const userStatus = user?.status;
      if (userStatus === 'blocked') {
        throw new AppError(StatusCodes.FORBIDDEN, 'Your account is blocked!');
      }

      // checking if any hacker using a token even-after the user changed the password
      if (
        user.passwordChangedAt &&
        (await User.isJWTIssuedBeforePasswordChanged(
          user.passwordChangedAt,
          iat as number,
        ))
      ) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
      }

      if (requiredRoles && !requiredRoles.includes(role)) {
        throw new AppError(
          StatusCodes.UNAUTHORIZED,
          'You are not authorized yet!',
        );
      }

      req.user = decoded as JwtPayload;
      next();
    },
  );
};

export default auth;
