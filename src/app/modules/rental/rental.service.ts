import { Rental } from './rental.model';
import { TRental } from './rental.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { rentalSearchableFields } from './rental.constant';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { IImageFiles } from '../../interface/ImageFile';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
// import { Types } from 'mongoose';

// create Rental
const createRentalIntoDB = async (
  rentalImages: IImageFiles,
  rentalData: TRental,
  userData: JwtPayload,
) => {
  const { rental } = rentalImages;
  if (!rental || rental.length === 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Rental images are required!');
  }

  const user = await User.isUserExistsByEmail(userData.email);

  // set an array of all images path
  rentalData.images = rental.map((image) => image.path);

  // set landlord from loggedIn user
  rentalData.landlord = user!._id;

  // const result = Rental.create(rentalData);
  const data = new Rental(rentalData);
  const result = await data.save();

  return result;
};

// get all Rentals
const getAllRentalsFromDB = async (query: Record<string, unknown>) => {
  const allRentalQuery = new QueryBuilder(
    Rental.find().populate('landlord'),
    query,
  )
    .search(rentalSearchableFields)
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await allRentalQuery.modelQuery;
  const meta = await allRentalQuery.countTotal();

  return {
    data,
    meta,
  };
};

// get Rental by id
const getSingleRentalFromDB = async (rentalID: string) => {
  // checking the _id validation for aggregate
  // if (!Types.ObjectId.isValid(rentalID)) {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID!'); // match with handleCastError
  // }
  // const result = await Rental.aggregate([
  //   { $match: { _id: new Types.ObjectId(rentalID) } },
  // ]);
  //  return result[0] || null;

  // checking if the Rental is exist
  const rental = await Rental.findById(rentalID).populate('landlord');
  if (!rental) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental not found!');
  }

  // checking if the Rental is already deleted
  const isDeleted = rental?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This rental is already deleted!',
    );
  }

  return rental;
};

// get Landlord Rentals by User Email
const getLandlordRentalsByUserEmailFromDB = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  const user = await User.isUserExistsByEmail(userData.email);

  // const rental = await Rental.find({
  //   landlord: new Types.ObjectId(user!._id),
  // }).populate('landlord');

  const myRentalQuery = new QueryBuilder(
    Rental.find({
      landlord: user!._id,
    }).populate('landlord'),
    query,
  )
    .search(rentalSearchableFields)
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await myRentalQuery.modelQuery;
  const meta = await myRentalQuery.countTotal();

  return {
    data,
    meta,
  };
};

// update Rental by id
const updateRentalInDB = async (
  rentalID: string,
  rentalImages: IImageFiles,
  updatedData: TRental,
  userData: JwtPayload,
) => {
  // checking if the Rental is exist
  const savedRental = await Rental.findById(rentalID);
  if (!savedRental) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental not found!');
  }

  // checking if the Rental is already deleted
  const isDeleted = savedRental?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This rental is already deleted!',
    );
  }

  if (userData.role === 'landlord') {
    // checking if the landlord is the owner of the Rental
    const landlord = await User.isUserExistsByEmail(userData.email);
    if (savedRental.landlord.toString() !== landlord!._id.toString()) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized!');
    }
  }

  // // check if the Rental is already rented
  // if (savedRental.isRented) {
  //   throw new AppError(StatusCodes.FORBIDDEN, 'This rental is already rented!');
  // }

  // images part optional for updating
  const { rental } = rentalImages;
  if (rental) {
    // set an array of all images path
    const newImages = rental.map((image) => image.path);
    if (updatedData.images) {
      updatedData.images = [...updatedData.images, ...newImages];
    } else {
      updatedData.images = newImages;
    }
  }

  savedRental.set(updatedData);
  const result = await savedRental.save();
  return result;
};

// delete Rental by id
const deleteRentalFromDB = async (rentalId: string, userData: JwtPayload) => {
  // checking if the Rental is exist
  const rental = await Rental.findById(rentalId);
  if (!rental) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Rental not found!');
  }

  // checking if the Rental is already deleted
  const isDeleted = rental?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This rental is already deleted!',
    );
  }

  if (userData.role === 'landlord') {
    const landlord = await User.isUserExistsByEmail(userData.email);
    // checking if the landlord is the owner of the Rental
    if (rental.landlord.toString() !== landlord!._id.toString()) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized!');
    }
  }

  // // check if the Rental is already in an existing agreement
  // const agreement = await Agreement.findOne({ rental: rentalId });

  // // checking if the Agreement is existing
  // const isAgreementDeleted = agreement?.isDeleted;
  // if (agreement && !isAgreementDeleted) {
  //   throw new AppError(
  //     StatusCodes.FORBIDDEN,
  //     'This Rental is in an agreement and cannot be deleted!',
  //   );
  // }

  // checking if the Rental is already rented
  const isRented = rental?.isRented;
  if (isRented) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This rental is in an agreement and cannot be deleted!',
    );
  }

  // soft delete - update the isDeleted field to true
  await Rental.findByIdAndUpdate(rentalId, { isDeleted: true });

  return null;
};

export const RentalService = {
  createRentalIntoDB,
  getAllRentalsFromDB,
  getSingleRentalFromDB,
  getLandlordRentalsByUserEmailFromDB,
  updateRentalInDB,
  deleteRentalFromDB,
};
