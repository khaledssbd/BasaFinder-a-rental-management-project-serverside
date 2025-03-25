import { z } from 'zod';

const createPaymentValidationSchema = z.object({
  body: z.object({
    agreement: z.string({
      required_error: 'Agreement is required!',
      invalid_type_error: 'Agreement must be string!',
    }),

    months: z
      .array(
        z.string().refine((val) => typeof val === 'string', {
          message: 'Months must be a string!',
        }),
      )
      .min(1, { message: 'Months must have minimum 1 item!' }),

    // rental: z
    //   .string({
    //     required_error: 'Rental is required!',
    //     invalid_type_error: 'Rental must be string!',
    //   })
    //   .trim()
    //   .min(8, { message: 'Rental must have minimum 8 characters!' }),

    // landlord: z
    //   .string({
    //     required_error: 'Landlord is required!',
    //     invalid_type_error: 'Landlord must be string!',
    //   })
    //   .trim()
    //   .min(8, { message: 'Landlord must have minimum 8 characters!' }),

    // tenant: z
    //   .string({
    //     required_error: 'Tenant is required!',
    //     invalid_type_error: 'Tenant must be string!',
    //   })
    //   .trim()
    //   .min(8, { message: 'Tenant must have minimum 8 characters!' }),

    // amount: z
    //   .number({
    //     required_error: 'Amount is required!',
    //     invalid_type_error: 'Amount must be a number!',
    //   })
    //   .positive()
    //   .min(1, 'Amount must be a positive number!'),
  }),
});

const changePaymentStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['Paid', 'Failed'], {
      errorMap: () => ({
        message: "Update status must be one of 'Paid' and 'Failed'!",
      }),
    }),
  }),

  // params: z.object({
  //   paymentId: z.string({
  //     required_error: 'Payment ID is required!',
  //     invalid_type_error: 'Payment ID must be string!',
  //   }),
  // }), // no need to use as params works as URL
});

const validatePaymentValidationSchema = z.object({
  query: z.object({
    tran_id: z.string({
      required_error: 'Transaction ID is required!',
      invalid_type_error: 'Transaction ID must be string!',
    }),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  changePaymentStatusValidationSchema,
  validatePaymentValidationSchema,
};
