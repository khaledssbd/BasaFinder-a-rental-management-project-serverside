import { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const notFound: RequestHandler = async (req, res, next) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Route is not found! Please try again',
    error: 'The requested resource could not be found! Please try again',
  });
};

export default notFound;
