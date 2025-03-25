import { Types } from 'mongoose';

// Agreement type
export type TAgreement = {
  rental: Types.ObjectId;
  landlord: Types.ObjectId;
  landlordContactNo?: string;
  tenant: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  moveInDate: Date;
  durationMonth: number;
  isDeleted: boolean; // default: false
  createdAt?: Date;
  updatedAt?: Date;
};
