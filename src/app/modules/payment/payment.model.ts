import { Schema, model } from 'mongoose';
import { TPayment } from './payment.interface';

const paymentSchema = new Schema<TPayment>(
  {
    agreement: {
      type: Schema.Types.ObjectId,
      ref: 'Agreement',
      required: true,
    },

    rental: {
      type: Schema.Types.ObjectId,
      ref: 'Rental',
      required: true,
    },

    landlord: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    tenant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      required: true,
      default: 'Pending',
    },

    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'Online'],
      default: 'Online',
    },

    transactionId: {
      type: String,
      default: null,
    },

    gatewayResponse: {
      type: Schema.Types.Mixed,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Payment = model<TPayment>('Payment', paymentSchema);
