import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { User } from './user.model';
import { StatusCodes } from 'http-status-codes';

// get all users
const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const allUsersQuery = new QueryBuilder(User.find(), query)
    .search(['name', 'email', 'role', 'status'])
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await allUsersQuery.modelQuery;
  const meta = await allUsersQuery.countTotal();

  return {
    data,
    meta,
  };
};

// change user Role
const changeUserRoleIntoDB = async (
  userId: string,
  payload: { role: string },
) => {
  // checking if the user is exist
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This account is already deleted!',
    );
  }

  // checking if the user is blocked
  const userStatus = user?.status;
  if (userStatus === 'blocked') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This account already is already blocked!',
    );
  }

  const { role } = payload;
  const result = await User.findByIdAndUpdate(
    userId,
    { role },
    {
      new: true, // returns the updated document, lest it returns the old document
    },
  );
  return result;
};

// change user status
const changeUserStatusIntoDB = async (
  userId: string,
  payload: { status: string },
) => {
  // checking if the user is exist
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This account is already deleted!',
    );
  }

  // checking if the user is blocked
  // const userStatus = user?.status;
  // if (userStatus === 'blocked') {
  //   throw new AppError(
  //     StatusCodes.FORBIDDEN,
  //     'This account is already blocked!',
  //   );
  // } // giving admin to activate a blocked user

  const { status } = payload;
  const result = await User.findByIdAndUpdate(
    userId,
    { status },
    {
      new: true, // returns the updated document, lest it returns the old document
    },
  );
  return result;
};

export const UserService = {
  getAllUsersFromDB,
  changeUserRoleIntoDB,
  changeUserStatusIntoDB,
};
