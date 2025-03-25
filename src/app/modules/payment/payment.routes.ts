import { Router } from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { AUTH_ROLES } from '../user/user.constant';
import { PaymentValidation } from './payment.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = Router();

router.post(
  '/',
  auth(AUTH_ROLES.tenant),
  // validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPayment,
);

router.get('/', auth(AUTH_ROLES.admin), PaymentController.getAllPayments);

router.get(
  '/landlord',
  auth(AUTH_ROLES.landlord),
  PaymentController.getLandlordPayments,
);

router.get(
  '/tenant',
  auth(AUTH_ROLES.tenant),
  PaymentController.getTenantPayments,
);

router.get(
  '/details/:paymentId',
  auth(AUTH_ROLES.tenant, AUTH_ROLES.landlord),
  PaymentController.getPaymentDetails,
);

router.patch(
  '/:paymentId/status',
  auth(AUTH_ROLES.admin),
  validateRequest(PaymentValidation.changePaymentStatusValidationSchema),
  PaymentController.changePaymentStatus,
);

router.patch(
  '/validate',
  auth(AUTH_ROLES.tenant, AUTH_ROLES.landlord, AUTH_ROLES.admin),
  validateRequest(PaymentValidation.validatePaymentValidationSchema),
  PaymentController.validatePayment,
);

export const PaymentRoutes = router;
