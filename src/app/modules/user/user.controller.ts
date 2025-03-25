/* eslint-disable @typescript-eslint/no-explicit-any */
import tryCatchAsync from '../../utils/tryCatchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';

// get all users
const getAllUsers = tryCatchAsync(async (req, res) => {
  const result = await UserService.getAllUsersFromDB(req.query);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// change user Role
const changeUserRole = tryCatchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await UserService.changeUserRoleIntoDB(userId, req.body);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Role is updated successfully!',
    data: result,
  });
});


// change user status
const changeUserStatus = tryCatchAsync(async (req, res) => {
  const userId = req.params.id;
  const result = await UserService.changeUserStatusIntoDB(userId, req.body);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Status is updated successfully!',
    data: result,
  });
});

export const UserController = { getAllUsers,changeUserRole, changeUserStatus };
