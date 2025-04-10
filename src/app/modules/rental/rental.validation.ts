import { z } from 'zod';

// createRental validation using zod
const createRentalValidationSchema = z.object({
  body: z.object({
    location: z
      .string({
        required_error: 'Location is required!',
        invalid_type_error: 'Location must be string!',
      })
      .trim()
      .min(2, { message: 'Location must have minimum 2 characters!' })
      .max(80, { message: 'Location cannot exceed 80 characters!' }),

    description: z
      .string({
        required_error: 'Description is required!',
        invalid_type_error: 'Description must be string!',
      })
      .min(20, { message: 'Description must have minimum 20 characters!' })
      .trim(),

    rent: z
      .number({
        required_error: 'Rent is required!',
        invalid_type_error: 'Rent must be a number!',
      })
      .positive()
      .min(1, 'Rent must be a positive number!'),

    bedrooms: z
      .number({
        required_error: 'Bedrooms is required!',
        invalid_type_error: 'Bedrooms must be a number!',
      })
      .positive()
      .min(1, 'Bedrooms must be a positive number!'),

    // landlord: z
    //   .string({
    //     required_error: 'Landlord is required!',
    //     invalid_type_error: 'Landlord must be string!',
    //   })
    //   .trim(),
  }),
});

// updateRentalById validation using zod
const updateRentalValidationSchema = z.object({
  body: z.object({
    location: z
      .string({
        required_error: 'Location is required!',
        invalid_type_error: 'Location must be string!',
      })
      .trim()
      .min(2, { message: 'Location must have minimum 2 characters!' })
      .max(80, { message: 'Location cannot exceed 80 characters!' }),

    description: z
      .string({
        required_error: 'Description is required!',
        invalid_type_error: 'Description must be string!',
      })
      .min(20, { message: 'Description must have minimum 20 characters!' })
      .trim(),

    rent: z
      .number({
        required_error: 'Rent is required!',
        invalid_type_error: 'Rent must be a number!',
      })
      .positive()
      .min(1, 'Rent must be a positive number!'),

    bedrooms: z
      .number({
        required_error: 'Bedrooms is required!',
        invalid_type_error: 'Bedrooms must be a number!',
      })
      .positive()
      .min(1, 'Bedrooms must be a positive number!'),
  }),
});

export const RentalValidation = {
  createRentalValidationSchema,
  updateRentalValidationSchema,
};