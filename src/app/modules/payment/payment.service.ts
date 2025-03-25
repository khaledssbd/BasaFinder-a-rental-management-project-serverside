import { sslService } from './payment.utils';
import { JwtPayload } from 'jsonwebtoken';
import { TPayment } from './payment.interface';
import { User } from '../user/user.model';
import { Agreement } from '../agreement/agreement.model';
import { Rental } from '../rental/rental.model';
import { Payment } from './payment.model';
// import { generatePaymentInvoicePDF } from '../../utils/generatePaymentInvoicePDF';
// import { EmailHelper } from '../../utils/emailHelper';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// create Payment
const createPaymentIntoDB = async (
  paymentData: TPayment & { months: string[] },
  userData: JwtPayload,
) => {
  if (!paymentData.months.length) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Must select at least one month!',
    );
  }

  const user = await User.isUserExistsByEmail(userData.email);
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }
  const agreement = await Agreement.findById(paymentData.agreement);
  if (!agreement) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Agreement not found!');
  }
  if (agreement.status === 'pending') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Agreement is still pending!');
  }
  if (agreement.status === 'rejected') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Agreement is rejected!');
  }

  const rental = await Rental.findById(agreement.rental);
  if (!rental) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental not found!');
  }

  const transactionId = sslService.generateTransactionId();

  paymentData.tenant = user._id;
  paymentData.rental = agreement.rental;
  paymentData.landlord = agreement.landlord;
  paymentData.amount = paymentData.months.length * rental.rent;
  paymentData.status = 'Pending';
  paymentData.paymentMethod = 'Online'; // now all payments are online
  paymentData.transactionId = transactionId;

  // create the Payment
  const payment = new Payment(paymentData);

  const createdPayment = await payment.save();
  await createdPayment.populate(
    'agreement rental landlord tenant agreement.rental agreement.landlord agreement.tenant  rental.landlord',
  );

  let result;

  if (createdPayment.paymentMethod == 'Online') {
    result = await sslService.initializaPayment(
      createdPayment.amount,
      transactionId,
    );

    result = { paymentUrl: result };
  } else {
    result = payment;
  }

  // mail sending part
  // const invoiceData = {
  //   _id: payment._id,
  //   createdAt: payment.createdAt as Date,
  //   user,
  //   shippingAddress: 'N/A',
  //   paymentStatus: payment.status,
  //   paymentMethod: payment.paymentMethod,
  //   products: [
  //     {
  //       product: { name: rental.location },
  //       quantity: 0,
  //       unitPrice: rental.rent,
  //     },
  //   ],
  //   totalAmount: createdPayment.amount,
  //   discount: 0,
  //   deliveryCharge: 0,
  //   finalAmount: createdPayment.amount,
  // };

  // const pdfBuffer = await generatePaymentInvoicePDF(invoiceData);
  // const emailContent = await EmailHelper.createEmailContent(
  //   { userName: user.name || '' },
  //   'orderInvoice',
  // );

  // const attachment = {
  //   filename: `Invoice_${createdPayment._id}.pdf`,
  //   content: pdfBuffer,
  //   encoding: 'base64', // if necessary
  // };

  // await EmailHelper.sendEmail(
  //   user.email,
  //   emailContent as string,
  //   'Order confirmed!',
  //   attachment,
  // );

  return result;
};

// get All Payments
const getAllPaymentsFromDB = async (query: Record<string, unknown>) => {
  const paymentsQuery = new QueryBuilder(
    Payment.find().populate(
      'agreement rental landlord tenant agreement.rental agreement.landlord agreement.tenant  rental.landlord',
    ),
    query,
  )
    .search(['rental.location', 'rental.description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await paymentsQuery.modelQuery;
  const meta = await paymentsQuery.countTotal();

  return {
    data,
    meta,
  };
};

// get Landlord Payments
const getLandlordPaymentsFromDB = async (
  query: Record<string, unknown>,
  authUser: JwtPayload,
) => {
  const landlord = await User.isUserExistsByEmail(authUser.email);
  const paymentsQuery = new QueryBuilder(
    Payment.find({ landlord: landlord!._id }).populate(
      'agreement rental landlord tenant agreement.rental agreement.landlord agreement.tenant  rental.landlord',
    ),
    query,
  )
    .search(['rental.location', 'rental.description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await paymentsQuery.modelQuery;
  const meta = await paymentsQuery.countTotal();

  return {
    data,
    meta,
  };
};

const getTenantPaymentsFromDB = async (
  query: Record<string, unknown>,
  authUser: JwtPayload,
) => {
  const tenant = await User.isUserExistsByEmail(authUser.email);
  const paymentsQuery = new QueryBuilder(
    Payment.find({ tenant: tenant!._id }).populate(
      'agreement rental landlord tenant agreement.rental agreement.landlord agreement.tenant  rental.landlord',
    ),
    query,
  )
    .search(['rental.location', 'rental.description'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const data = await paymentsQuery.modelQuery;
  const meta = await paymentsQuery.countTotal();

  return {
    data,
    meta,
  };
};

const getPaymentDetailsFromDB = async (
  paymentId: string,
  authUser: JwtPayload,
) => {
  const payment = await Payment.findById(paymentId).populate(
    'agreement rental landlord tenant agreement.rental agreement.landlord agreement.tenant  rental.landlord',
  );

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not Found!');
  }

  if (authUser.role === 'landlord') {
    const landlord = await User.findById(payment.landlord);

    if (!landlord || landlord.email !== authUser.email) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to view this payment!',
      );
    }
  } else if (authUser.role === 'tenant') {
    const tenant = await User.findById(payment.tenant);

    if (!tenant || tenant.email !== authUser.email) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        'You are not authorized to view this payment!',
      );
    }
  }

  return payment;
};

const changePaymentStatusInDB = async (
  paymentId: string,
  status: string,
  authUser: JwtPayload,
) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not Found!');
  }

  if (authUser.role === 'landlord') {
    const user = await User.isUserExistsByEmail(authUser.email);

    if (user!._id.toString() !== payment?.landlord.toString())
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to update this payment!',
      );
  }

  const result = await Payment.findByIdAndUpdate(
    paymentId,
    { status },
    { new: true },
  );

  return result;
};

// validate Payment
const validatePayment = async (tran_id: string, userData: JwtPayload) => {
  // this user will be exists as he/she passed the auth() middleware
  const user = await User.isUserExistsByEmail(userData.email);

  const payment = await Payment.findOne({ transactionId: tran_id });
  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not Found!');
  }

  // landlord is striked here
  if (userData.role === 'landlord') {
    if (user!._id.toString() !== payment?.landlord.toString()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized to update this payment!',
      );
    }
  }

  // tenant is striked here
  if (userData.role === 'tenant') {
    if (user!._id.toString() !== payment?.tenant.toString()) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        'You are not authorized tenant to update this payment!',
      );
    }
  }

  if (payment.status !== 'Pending') {
    throw new AppError(
      StatusCodes.CONFLICT,
      `You can't verify a ${payment.status} payment!`,
    );
  }

  const rental = await Rental.findById(payment.rental);
  if (!rental) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental not Found!');
  }

  const result = await sslService.validatePayment(
    tran_id,
    // userData, rental
  );

  return result;
};

export const PaymentService = {
  createPaymentIntoDB,
  getAllPaymentsFromDB,
  getLandlordPaymentsFromDB,
  getTenantPaymentsFromDB,
  getPaymentDetailsFromDB,
  changePaymentStatusInDB,
  validatePayment,
};
