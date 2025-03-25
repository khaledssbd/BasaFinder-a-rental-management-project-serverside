import { Types } from 'mongoose';

// Rental type
export type TRental = {
  location: string;
  description: string;
  rent: number;
  bedrooms: number;
  // bathrooms: number;
  // balcony: number;
  // area: number;
  images: string[];
  landlord: Types.ObjectId;
  isRented: boolean;
  isDeleted: boolean; // default: false
  createdAt?: Date;
  updatedAt?: Date;
};
