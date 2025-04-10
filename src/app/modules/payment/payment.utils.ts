/* eslint-disable no-console */
import SSLCommerzPayment from 'sslcommerz-lts';
import config from '../../config';
import { StatusCodes } from 'http-status-codes';
import { Payment } from '../payment/payment.model';
import AppError from '../../errors/AppError';
// import { generatePaymentInvoicePDF } from '../../utils/generatePaymentInvoicePDF';
// import { EmailHelper } from '../../utils/emailHelper';
// import { TRental } from '../rental/rental.interface';
// import { JwtPayload } from 'jsonwebtoken';

const generateTransactionId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const randomString = Math.random().toString(36).substring(2, 12);
  return `${timestamp}${randomString}`;
};

const store_id = config.ssl.store_id as string;
const store_password = config.ssl.store_password as string;
const is_live = false; // true for live, false for sandbox

// SSLCommerz init
const initializaPayment = async (total_amount: number, tran_id: string) => {
  const data = {
    total_amount,
    currency: 'BDT',
    tran_id, // Use unique tran_id for each API call
    success_url: `${config.ssl.validation_url}?tran_id=${tran_id}`,
    fail_url: config.ssl.fail_url as string,
    cancel_url: config.ssl.cancel_url as string,
    ipn_url: 'https://riderevolt-backend-khaled.vercel.app/api/v1/ssl/ipn',
    shipping_method: 'Courier',
    product_name: 'N/A.',
    product_category: 'N/A',
    product_profile: 'general',
    cus_name: 'N/A',
    cus_email: 'N/A',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01711111111',
    cus_fax: '01711111111',
    ship_name: 'N/A',
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };

  const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);

  try {
    const apiResponse = await sslcz.init(data);

    // Redirect the user to the payment gateway
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (GatewayPageURL) {
      return GatewayPageURL;
    } else {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        'Failed to generate payment gateway URL!',
      );
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred while processing payment!',
    );
  }
};

// validate Payment
const validatePayment = async (
  tran_id: string,
  //   userData: JwtPayload,
  //   rental: TRental,
) => {
  const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);

  const validationResponse = await sslcz.transactionQueryByTransactionId({
    tran_id,
  });

  let data;

  if (
    validationResponse.element[0].status === 'VALID' ||
    validationResponse.element[0].status === 'VALIDATED'
  ) {
    data = {
      status: 'Paid',
      gatewayResponse: validationResponse.element[0],
    };
  } else if (validationResponse.element[0].status === 'INVALID_TRANSACTION') {
    data = {
      status: 'Failed',
      gatewayResponse: validationResponse.element[0],
    };
  } else {
    data = {
      status: 'Failed',
      gatewayResponse: validationResponse.element[0],
    };
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { transactionId: validationResponse.element[0].tran_id },
    data,
    { new: true },
  );

  if (!updatedPayment) {
    throw new AppError(StatusCodes.NOT_MODIFIED, 'Payment not updated!');
  }

  if (data.status === 'Failed') {
    throw new AppError(StatusCodes.EXPECTATION_FAILED, 'Payment failed!');
  }

  // mail sending part
  //   const invoiceData = {
  //     _id: updatedPayment._id,
  //     createdAt: updatedPayment.createdAt as Date,
  //     user: { name: userData.name },
  //     shippingAddress: 'N/A',
  //     paymentStatus: updatedPayment.status,
  //     paymentMethod: updatedPayment.paymentMethod,
  //     products: [
  //       {
  //         product: { name: rental.location },
  //         quantity: 0,
  //         unitPrice: rental.rent,
  //       },
  //     ],
  //     totalAmount: updatedPayment.amount,
  //     discount: 0,
  //     deliveryCharge: 0,
  //     finalAmount: updatedPayment.amount,
  //   };

  //   const pdfBuffer = await generatePaymentInvoicePDF(invoiceData);
  //   const emailContent = await EmailHelper.createEmailContent(
  //     { userName: userData.name || '' },
  //     'orderInvoice',
  //   );

  //   const attachment = {
  //     filename: `Invoice_${updatedPayment._id}.pdf`,
  //     content: pdfBuffer,
  //     encoding: 'base64',
  //   };

  //   await EmailHelper.sendEmail(
  //     userData.email,
  //     emailContent as string,
  //     'Order confirmed-Payment Success!',
  //     attachment,
  //   );

  return updatedPayment;
};

export const sslService = {
  generateTransactionId,
  initializaPayment,
  validatePayment,
};
