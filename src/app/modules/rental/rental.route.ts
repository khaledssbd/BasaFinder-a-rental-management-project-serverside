import express from 'express';
import { RentalController } from './rental.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RentalValidation } from './rental.validation';
import { AUTH_ROLES } from '../user/user.constant';
import { multerUpload } from '../../config/multer.config';
import { parseBody } from '../../middlewares/bodyParser';

const router = express.Router();

// create Rental
router.post(
  '/',
  auth(AUTH_ROLES.landlord),
  multerUpload.fields([{ name: 'rental' }]), // better fieldname for url
  parseBody,
  validateRequest(RentalValidation.createRentalValidationSchema),
  RentalController.createRental,
);

// get all Rentals
router.get('/', RentalController.getAllRentals);

// get Rental by id
router.get('/:rentalId', RentalController.getRentalById);

// get Rental by user email
router.get(
  '/landlord/mine',
  auth(AUTH_ROLES.landlord),
  RentalController.getLandlordRentalsByUserEmail,
);

// update Rental by id
router.patch(
  '/update/:rentalId',
  auth(AUTH_ROLES.landlord, AUTH_ROLES.admin),
  multerUpload.fields([{ name: 'rental' }]), // better fieldname for url
  parseBody,
  validateRequest(RentalValidation.updateRentalValidationSchema),
  RentalController.updateRentalById,
);

// delete Rental by id
router.delete(
  '/:rentalId',
  auth(AUTH_ROLES.landlord, AUTH_ROLES.admin),
  RentalController.deleteRentalById,
);

export const RentalRoutes = router;
