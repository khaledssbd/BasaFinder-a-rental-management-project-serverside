/* eslint-disable @typescript-eslint/no-explicit-any */
import { RentalService } from './rental.service';
import tryCatchAsync from '../../utils/tryCatchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { IImageFiles } from '../../interface/ImageFile';

// create Rental
const createRental = tryCatchAsync(async (req, res) => {
  const result = await RentalService.createRentalIntoDB(
    req.files as IImageFiles,
    req.body,
    req.user,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental added successfully!',
    data: result,
  });
});

// get all Rentals
const getAllRentals = tryCatchAsync(async (req, res) => {
  const result = await RentalService.getAllRentalsFromDB(req.query);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// get a Rental by id
const getRentalById = tryCatchAsync(async (req, res) => {
  const rentalId = req.params.rentalId;

  const result = await RentalService.getSingleRentalFromDB(rentalId);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental retrieved successfully!',
    data: result,
  });
});

// get landlord Rentals by User Email
const getLandlordRentalsByUserEmail = tryCatchAsync(async (req, res) => {
  const result = await RentalService.getLandlordRentalsByUserEmailFromDB(
    req.user,
    req.query,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rentals retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// update Rental by id
const updateRentalById = tryCatchAsync(async (req, res) => {
  const { rentalId } = req.params;
  const rentalData = req.body;

  const result = await RentalService.updateRentalInDB(
    rentalId,
    req.files as IImageFiles,
    rentalData,
    req.user
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental updated successfully!',
    data: result,
  });
});

// delete Rental by id
const deleteRentalById = tryCatchAsync(async (req, res) => {
  const { rentalId } = req.params;
  const result = await RentalService.deleteRentalFromDB(rentalId, req.user);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Rental deleted successfully!',
    data: result,
  });
});

export const RentalController = {
  createRental,
  getAllRentals,
  getRentalById,
  getLandlordRentalsByUserEmail,
  updateRentalById,
  deleteRentalById,
};
