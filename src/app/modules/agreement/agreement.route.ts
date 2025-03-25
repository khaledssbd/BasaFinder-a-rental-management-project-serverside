import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AUTH_ROLES } from '../user/user.constant';
import { AgreementValidation } from './agreement.validation';
import { AgreementController } from './agreement.controller';

const router = express.Router();

// create Agreement
router.post(
  '/',
  auth(AUTH_ROLES.tenant),
  validateRequest(AgreementValidation.createAgreementValidationSchema),
  AgreementController.requestAgreement,
);

// get all Agreements
router.get('/', auth(AUTH_ROLES.admin), AgreementController.getAllAgreements);

// get Agreements by landlord email
router.get(
  '/landlord',
  auth(AUTH_ROLES.landlord),
  AgreementController.getLandlordAgreements,
);

// get Agreements by tenant email
router.get(
  '/tenant/',
  auth(AUTH_ROLES.tenant),
  AgreementController.getTenantAgreements,
);

// update Agreement Status by id
router.put(
  '/status/:id',
  auth(AUTH_ROLES.landlord),
  validateRequest(AgreementValidation.updateAgreementStatusValidationSchema),
  AgreementController.updateAgreementStatusById,
);

// add Landlord Contact Number
router.patch(
  '/landlord-contact-no/:id',
  auth(AUTH_ROLES.landlord),
  validateRequest(AgreementValidation.addLandlordContactNumberValidationSchema),
  AgreementController.addLandlordContactNumber,
);

// delete Agreement by id
router.delete(
  '/:id',
  auth(AUTH_ROLES.landlord),
  AgreementController.deleteAgreementById,
);

export const AgreementRoutes = router;
