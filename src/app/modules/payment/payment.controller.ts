import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import tryCatchAsync from '../../utils/tryCatchAsync';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';

// create Payment
const createPayment = tryCatchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createPaymentIntoDB(req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment initiated, pay quickly!',
    data: result,
  });
});

// get All Payments (admin)
const getAllPayments = async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPaymentsFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payments retrived succesfully!',
    data: result.data,
    meta: result.meta,
  });
};

// get Landlord Payments
const getLandlordPayments = tryCatchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentService.getLandlordPaymentsFromDB(
      req.query,
      req.user,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payments retrived succesfully!',
      data: result.data,
      meta: result.meta,
    });
  },
);

// get Tenant Payments
const getTenantPayments = tryCatchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getTenantPaymentsFromDB(
    req.query,
    req.user,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payments retrived succesfully!',
    data: result.data,
    meta: result.meta,
  });
});

// get Payment Details
const getPaymentDetails = tryCatchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getPaymentDetailsFromDB(
    req.params.paymentId,
    req.user,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment retrived succesfully!',
    data: result,
  });
});

// change Payment Status
const changePaymentStatus = tryCatchAsync(
  async (req: Request, res: Response) => {
    const { status } = req.body;

    const result = await PaymentService.changePaymentStatusInDB(
      req.params.paymentId,
      status,
      req.user,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Payment status changed succesfully!',
      data: result,
    });
  },
);

// validate Payment
const validatePayment = tryCatchAsync(async (req: Request, res: Response) => {
  const tran_id = req.query.tran_id as string;

  const result = await PaymentService.validatePayment(
    tran_id,
    req.user
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment validated succesfully!',
    data: result,
  });
});

export const PaymentController = {
  createPayment,
  getAllPayments,
  getLandlordPayments,
  getTenantPayments,
  getPaymentDetails,
  changePaymentStatus,
  validatePayment,
};
