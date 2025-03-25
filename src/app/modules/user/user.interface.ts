import { Model, Types } from 'mongoose';
import { AUTH_ROLES } from './user.constant';

export interface TUser {
  _id: Types.ObjectId;
  name: string;
  image: string;
  email: string;
  password: string;
  passwordChangedAt?: Date;
  role: 'tenant' | 'landlord' | 'admin';
  status: 'active' | 'blocked'; // default 'active'
  // address: string;
  // city: string;
  // phone: string;
  isDeleted: boolean; // default: false
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser | null>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;

  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): Promise<boolean>;
}

export type TUserRole = keyof typeof AUTH_ROLES; // "tenant" | "landlord" | "admin"

export type TLoginUser = {
  email: string;
  password: string;
};
