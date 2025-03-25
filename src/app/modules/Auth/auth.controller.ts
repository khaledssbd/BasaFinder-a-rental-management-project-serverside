/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import tryCatchAsync from '../../utils/tryCatchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import { IImageFile } from '../../interface/ImageFile';

// register User
const registerUser = tryCatchAsync(async (req, res) => {
  const userData = req.body;
  const result = await AuthServices.registerUserIntoDB(
    req.file as IImageFile,
    userData,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Registration is successfull!',
    data: result,
  });
});

// login User
const login = tryCatchAsync(async (req, res) => {
  const result = await AuthServices.login(req.body);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Logged in successfully!',
    data: result,
  });
});

// updateProfile
const updateProfile = tryCatchAsync(async (req, res) => {
  const payload = req.body;
  const result = await AuthServices.updateProfileIntoDB(
    req.file as IImageFile,
    req.user,
    payload,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile is updated successfully!',
    data: result,
  });
});

// change user Password
const changePassword = tryCatchAsync(async (req, res) => {
  const result = await AuthServices.changePassword(req.user, req.body);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed. Login again!',
    data: result,
  });
});

// refresh user access token
const refreshToken = tryCatchAsync(async (req, res) => {
  const { authorization } = req.headers;

  const { accessToken } = await AuthServices.refreshToken(
    authorization as string,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: {
      accessToken,
    },
  });
});

// forget password - send email with reset link
const forgotPassword = tryCatchAsync(async (req, res) => {
  const userEmail = req.body.email;
  const result = await AuthServices.forgotPassword(userEmail);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reset link is mailed, check inbox!',
    data: result,
  });
});

// reset password - verify token and update password using reset link
const resetPassword = tryCatchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(
    req.body,
    req.query as { email: string; token: string },
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  login,
  updateProfile,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
};
