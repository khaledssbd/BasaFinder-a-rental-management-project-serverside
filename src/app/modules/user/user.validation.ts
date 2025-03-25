import { z } from 'zod';
import { userRole, userStatus } from './user.constant';

// change User Role Validation Schema
const changeUserRoleValidationSchema = z.object({
  body: z.object({
    role: z.enum([...userRole] as [string, ...string[]], {
      errorMap: () => ({
        message: "Role must be one of 'tenant' and 'landlord'!",
      }),
    }),
  }),
});

// blockUser validation using zod
const changeUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([...userStatus] as [string, ...string[]], {
      errorMap: () => ({
        message: "Status must be one of 'active' and 'blocked'!",
      }),
    }),
  }),
});

export const UserValidation = {
  changeUserRoleValidationSchema,
  changeUserStatusValidationSchema,
};
