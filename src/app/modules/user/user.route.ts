import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AUTH_ROLES } from './user.constant';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';

const router = express.Router();

// get all users
router.get('/', auth(AUTH_ROLES.admin), UserController.getAllUsers);

// change user role
router.put(
  '/change-role/:id',
  auth(AUTH_ROLES.admin),
  validateRequest(UserValidation.changeUserRoleValidationSchema),
  UserController.changeUserRole,
);
// change user status
router.put(
  '/change-status/:id',
  auth(AUTH_ROLES.admin),
  validateRequest(UserValidation.changeUserStatusValidationSchema),
  UserController.changeUserStatus,
);

export const UserRoutes = router;
