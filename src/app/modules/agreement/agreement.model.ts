import { model, Schema } from 'mongoose';
import { TAgreement } from './agreement.interface';

// Agreement Schema
const agreementSchema = new Schema<TAgreement>(
  {
    rental: {
      type: Schema.Types.ObjectId,
      required: [true, 'Location is required!'],
      trim: true,
      ref: 'Rental', // model name
    },

    landlord: {
      type: Schema.Types.ObjectId,
      required: [true, 'Landlord is required!'],
      ref: 'User', // model name
    },

    landlordContactNo: {
      type: String,
      trim: true,
    },

    tenant: {
      type: Schema.Types.ObjectId,
      required: [true, 'Tenant is required!'],
      ref: 'User', // model name
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid status!',
      },
      default: 'pending', // default
    },

    moveInDate: {
      type: Date,
      required: [true, 'Move in date is required!'],
      trim: true,
    },

    durationMonth: {
      type: Number,
      required: [true, 'Duration month is required!'],
      trim: true,
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

// Agreement Query middleware #1 (for find)
agreementSchema.pre('find', function (next) {
  // while we are getting all data by using find method we want to exclude the data that has isDeleted: true
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Agreement Query middleware #2 (for findOne)
agreementSchema.pre('findOne', function (next) {
  // while we are getting single data by using findOne method we want to exclude the data that has isDeleted: true
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Agreement Query middleware #3 (for aggregate)
agreementSchema.pre('aggregate', function (next) {
  // while we are getting all data by using aggregate(find) method we want to exclude the data that has isDeleted: true
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Agreement Model
export const Agreement = model<TAgreement>('Agreement', agreementSchema);
