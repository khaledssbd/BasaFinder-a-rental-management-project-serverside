/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { TLoginUser, TUser } from '../user/user.interface';
import { createToken, verifyToken } from './auth.utils';
import { sendEmail } from '../../utils/sendEmail';
import { User } from '../user/user.model';
import { IImageFile } from '../../interface/ImageFile';
import fs from 'fs';
import path from 'path';

type TUserData = Pick<TUser, 'name' | 'email' | 'password' | 'role' | 'image'>;

// register User
const registerUserIntoDB = async (image: IImageFile, payload: TUserData) => {
  // checking user email is either user
  const user = await User.findOne({ email: payload.email });
  if (user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Email already used!');
  } // email:unique in User model (using to show error message in data.massage)

  payload.email = payload.email.toLowerCase();

  let role = payload.role;
  if (role === 'admin') {
    role = 'tenant'; // forcefully changing role to tenant if somehow trying to be admin
  }

  if (image && image.path) {
    // sending image is optional
    payload.image = image.path;
  }

  // creating user
  await User.create(payload);

  // create token and send to the user
  const jwtPayload = {
    email: payload.email,
    name: payload.name,
    // image: payload.image || '',
    image: payload.image,
    role: payload.role,
  };

  // creating accessToken
  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string,
  );

  // creating refreshToken
  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// login User
const login = async (payload: TLoginUser) => {
  const userEmail = payload.email.toLowerCase();

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userEmail);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is deleted!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is blocked!');
  }

  //checking if the password is correct
  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(StatusCodes.FORBIDDEN, 'Password is wrong!');

  // create token and send to the user
  const jwtPayload = {
    email: user.email,
    name: user.name,
    image: user.image || '',
    role: user.role,
  };

  // creating accessToken
  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string,
  );

  // creating refreshToken
  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// updateProfile
const updateProfileIntoDB = async (
  image: IImageFile,
  userData: JwtPayload,
  payload: TUser,
) => {
  const {
    email,
    password,
    passwordChangedAt,
    role,
    status,
    isDeleted,
    ...updateData
  } = payload;

  // sending image is optional
  if (image && image.path) {
    updateData.image = image.path;
  }

  // completing update
  const newdata = await User.findOneAndUpdate(
    { email: userData.email, role: userData.role },
    updateData,
    {
      new: true,
    },
  );

  // create token and send to the user
  const jwtPayload = {
    email: newdata!.email,
    name: newdata!.name,
    image: newdata!.image,
    role: newdata!.role,
  };

  // creating accessToken
  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string,
  );

  // creating refreshToken
  const refreshToken = createToken(
    jwtPayload,
    config.jwt.jwt_refresh_secret as string,
    config.jwt.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// change user Password
const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist - deleted - blocked already handled by auth() middleware
  const user = await User.isUserExistsByEmail(userData.email);

  // checking if the password is correct
  if (
    !(await User.isPasswordMatched(
      payload.oldPassword,
      user?.password as string,
    ))
  ) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Password is not matched!');
  }

  if (payload.oldPassword === payload.newPassword) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Must use unique password!');
  }
  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: userData.email,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

// refresh user access token
const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is deleted!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is blocked!');
  }

  // checking if the any hacker using a token even-after the user changed the password
  if (
    user.passwordChangedAt &&
    (await User.isJWTIssuedBeforePasswordChanged(
      user.passwordChangedAt,
      iat as number,
    ))
  ) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  const jwtPayload = {
    email: user.email,
    name: user.name,
    image: user.image || '',
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt.jwt_access_secret as string,
    config.jwt.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

// forget password - send email with reset link
const forgotPassword = async (userEmail: string) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(userEmail.toLowerCase());
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is deleted!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is blocked!');
  }

  const jwtPayload = {
    email: user.email,
    name: user.name,
    image: user.image || '',
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt.jwt_pass_reset_secret as string,
    config.jwt.jwt_pass_reset_secret_expires_in as string,
  );

  const resetUILink = `${config.reset_pass_ui_page_link}?email=${user.email}&token=${resetToken}`;

  sendEmail({
    subject: 'Reset your password within 10 minutes!',
    to: user.email,
    fileName: 'ForgotPassword.html',
    buttonLink: resetUILink,
  });

  return null;
};

// reset password - verify token and update password using reset link
const resetPassword = async (
  payload: { newPassword: string },
  query: { email: string; token: string },
) => {
  // checking if the given token is valid(not empty string)
  if (!query.token) {
    throw new AppError(
      StatusCodes.UNAUTHORIZED,
      'Token is required for resetting password!',
    );
  }

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(query?.email.toLowerCase());
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is deleted!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'This account is blocked!');
  }

  const decoded = verifyToken(
    query.token,
    config.jwt.jwt_pass_reset_secret as string,
  );

  if (query.email !== decoded.email) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are forbidden!');
  }

  // hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

export const AuthServices = {
  registerUserIntoDB,
  login,
  updateProfileIntoDB,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
