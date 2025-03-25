import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';
import { userRole, userStatus } from './user.constant';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required!'],
      trim: true,
    },

    image: {
      type: String,
    },

    email: {
      type: String,
      required: [true, 'Email is required!'],
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: 0, // will hide the password field from all find methods
    },

    passwordChangedAt: {
      type: Date,
    },

    role: {
      type: String,
      enum: {
        values: userRole,
        message: '{VALUE} is not a valid role!',
      },
    },

    status: {
      type: String,
      enum: {
        values: userStatus,
        message: '{VALUE} is not a valid status!',
      },
      default: 'active', // default
    },

    // address: {
    //   type: String,
    //   default: 'N/A',
    // },
    // city: {
    //   type: String,
    //   default: 'N/A',
    // },
    // phone: {
    //   type: String,
    //   default: 'N/A',
    // },

    isDeleted: {
      type: Boolean,
      default: false, // default
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre('save', async function (next) {
  // Hashing password before saving
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  // Hiding the Hashed password from returned data
  doc.password = '';
  next();
});

// isUserExistsByEmail
userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password'); // will show the password
};

// isPasswordMatched
userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

// isJWTIssuedBeforePasswordChanged
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
