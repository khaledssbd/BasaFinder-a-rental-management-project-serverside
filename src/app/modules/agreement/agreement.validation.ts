import { z } from 'zod';

// createAgreement validation using zod
const createAgreementValidationSchema = z.object({
  body: z.object({
    rental: z
      .string({
        required_error: 'Rental is required!',
        invalid_type_error: 'Rental must be string!',
      })
      .trim()
      .min(8, { message: 'Rental must have minimum 8 characters!' })
      .max(80, { message: 'Rental cannot exceed 80 characters' }),

    moveInDate: z.string({
      required_error: 'Move-in date is required!',
      invalid_type_error: 'Move-in date must be a string!',
    }),

    durationMonth: z
      .number({
        required_error: 'Duration month is required!',
        invalid_type_error: 'Duration month must be a number!',
      })
      .positive('Duration month must be a positive number')
      .min(1, 'Duration month must be at least 1'),
  }),
});

// updateAgreementStatus validation using zod
const updateAgreementStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      errorMap: () => ({
        message: "Update status must be one of 'approved' and 'rejected'!",
      }),
    }),
  }),
});

// addLandlordContactNumber validation using zod
const addLandlordContactNumberValidationSchema = z.object({
  body: z.object({
    landlordContactNo: z
      .string()
      .trim()
      .min(1, { message: 'Contact Number is required!' })
      .regex(/^01\d{9}$/, {
        message: 'Must be a valid Bangladeshi number!',
      }),
  }),
});

export const AgreementValidation = {
  createAgreementValidationSchema,
  updateAgreementStatusValidationSchema,
  addLandlordContactNumberValidationSchema,
};
