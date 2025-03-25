/* eslint-disable @typescript-eslint/no-explicit-any */
import tryCatchAsync from '../../utils/tryCatchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { AgreementService } from './agreement.service';

// create Agreement
const requestAgreement = tryCatchAsync(async (req, res) => {
  const result = await AgreementService.requestAgreementIntoDB(
    req.body,
    req.user,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreement added successfully!',
    data: result,
  });
});

// get all Agreements
const getAllAgreements = tryCatchAsync(async (req, res) => {
  const result = await AgreementService.getAllAgreementsFromDB(req.query);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreements retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// get Landlord Agreements by id
const getLandlordAgreements = tryCatchAsync(async (req, res) => {
  const result = await AgreementService.getLandlordAgreementsFromDB(
    req.user,
    req.query,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreements retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// get Tenant Agreements by id
const getTenantAgreements = tryCatchAsync(async (req, res) => {
  const result = await AgreementService.getTenantAgreementsFromDB(
    req.user,
    req.query,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreements retrieved successfully!',
    data: result.data,
    meta: result.meta,
  });
});

// update Agreement Status by id
const updateAgreementStatusById = tryCatchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const result = await AgreementService.updateAgreementStatusInDB(
    id,
    updateData,
    req.user,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreement updated successfully!',
    data: result,
  });
});

// add Landlord Contact Number
const addLandlordContactNumber = tryCatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgreementService.addLandlordContactNumberFromDB(
    id,
    req.body,
    req.user,
  );

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Contact added successfully!',
    data: result,
  });
});

// delete Agreement by id
const deleteAgreementById = tryCatchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AgreementService.deleteAgreementFromDB(id);

  sendResponse<any>(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Agreement deleted successfully!',
    data: result,
  });
});

export const AgreementController = {
  requestAgreement,
  getAllAgreements,
  getLandlordAgreements,
  getTenantAgreements,
  updateAgreementStatusById,
  addLandlordContactNumber,
  deleteAgreementById,
};
