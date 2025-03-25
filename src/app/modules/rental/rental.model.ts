import { model, Schema } from 'mongoose';
import { TRental } from './rental.interface';

// Rental Schema
const rentalSchema = new Schema<TRental>(
  {
    location: {
      type: String,
      required: [true, 'Location is required!'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Description is required!'],
      trim: true,
    },

    rent: {
      type: Number,
      required: [true, 'Rent is required!'],
      trim: true,
    },

    bedrooms: {
      type: Number,
      required: [true, 'Bedrooms is required!'],
      trim: true,
    },

    // bathrooms: {
    //   type: Number,
    //   required: [true, 'Bathrooms is required!'],
    //   trim: true,
    // },

    // balconies: {
    //   type: Number,
    //   required: [true, 'Balconies is required!'],
    //   trim: true,
    // },

    // area: {
    //   type: Number,
    //   required: [true, 'Rental area is required!'],
    //   trim: true,
    // },

    images: {
      type: [String],
      required: [true, 'Image is required!'],
      trim: true,
    },

    landlord: {
      type: Schema.Types.ObjectId,
      required: [true, 'Landlord is required!'],
      ref: 'User', // model name
    },

    isRented: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

// Rental Query middleware #1 (for find)
rentalSchema.pre('find', function (next) {
  // while we are getting all data by using find method we want to exclude the data that has isDeleted: true
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Rental Query middleware #2 (for findOne)
rentalSchema.pre('findOne', function (next) {
  // while we are getting single data by using findOne method we want to exclude the data that has isDeleted: true
  this.find({ isDeleted: { $ne: true } });
  next();
});

// Rental Query middleware #3 (for aggregate)
rentalSchema.pre('aggregate', function (next) {
  // while we are getting all data by using aggregate(find) method we want to exclude the data that has isDeleted: true
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

// Rental Model
export const Rental = model<TRental>('Rental', rentalSchema);
