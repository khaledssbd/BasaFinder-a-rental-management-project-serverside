import { Types } from 'mongoose';

export type TPayment = {
  agreement: Types.ObjectId;
  rental: Types.ObjectId;
  landlord: Types.ObjectId;
  tenant: Types.ObjectId;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed'; // default: 'Pending',
  paymentMethod: 'Cash' | 'Card' | 'Online'; // default: 'Online',
  transactionId: string; // default: null,
  gatewayResponse?: Record<string, unknown>; // default: null,
  isDeleted: boolean; // default: false
  createdAt?: Date;
  updatedAt?: Date;
};
