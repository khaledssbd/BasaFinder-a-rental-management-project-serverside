import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';
import { Agreement } from './agreement.model';
import { TAgreement } from './agreement.interface';
import { agreementSearchableFields } from './agreement.constant';
// import { Types } from 'mongoose';
import { Rental } from '../rental/rental.model';
import config from '../../config';
import { sendEmail } from '../../utils/sendEmail';

// create Agreement
const requestAgreementIntoDB = async (
  agreementData: TAgreement,
  userData: JwtPayload,
) => {
  const tenant = await User.isUserExistsByEmail(userData.email);

  // checking if the Rental is exist
  const rental = await Rental.findById(agreementData.rental);
  if (!rental) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Rental not found!');
  }
  if (rental.isRented) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'This Rental is alredy rented!',
    );
  }

  const landlord = await User.findById(rental.landlord);
  if (!landlord) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Landlord not found!');
  }

  // checking if the tenant already requested for an agreement of this rental
  const agreement = await Agreement.findOne({
    rental: agreementData.rental,
    tenant: tenant!._id,
  });
  if (agreement) {
    throw new AppError(
      StatusCodes.CONFLICT,
      `You already have a ${agreement.status} agreement with this rental!`,
    );
  }

  // set tenant from loggedIn user
  agreementData.tenant = tenant!._id;

  // set landlord from Rental
  agreementData.landlord = rental.landlord;

  // set status to pending by default
  agreementData.status = 'pending'; // though default: pending, but just to make sure

  // const result = Agreement.create(agreementData);
  const data = await new Agreement(agreementData).populate(
    'tenant landlord rental',
  );

  const result = await data.save();

  // sending landlord an email notification
  const resetUILink = `${config.manage_landlord_agreements_ui_page_link}`;
  sendEmail({
    subject: 'New Agreement Request Alert!',
    to: landlord.email,
    fileName: 'AgreementRequestAlert.html',
    buttonLink: resetUILink,
    userName: landlord.name,
    rentalAddress: rental.location,
  });

  return result;
};

// get all Agreement
const getAllAgreementsFromDB = async (query: Record<string, unknown>) => {
  const allAgreementQuery = new QueryBuilder(
    Agreement.find().populate([
      { path: 'tenant' },
      { path: 'rental' },
      { path: 'landlord' },
    ]),
    query,
  )
    .search(agreementSearchableFields)
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await allAgreementQuery.modelQuery;
  const meta = await allAgreementQuery.countTotal();

  return {
    data,
    meta,
  };
};

// get Landlord Agreements by id
const getLandlordAgreementsFromDB = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  // checking the _id validation for aggregate
  // if (!Types.ObjectId.isValid(landlordId)) {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID!'); // match with handleCastError
  // }

  const user = await User.isUserExistsByEmail(userData.email);

  const allAgreementQuery = new QueryBuilder(
    Agreement.find({ landlord: user!._id }).populate('tenant rental landlord'),
    query,
  )
    .search(agreementSearchableFields)
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await allAgreementQuery.modelQuery;
  const meta = await allAgreementQuery.countTotal();

  return {
    data,
    meta,
  };
};

// get Tenant Agreements by id
const getTenantAgreementsFromDB = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  // checking the _id validation for aggregate
  // if (!Types.ObjectId.isValid(landlordId)) {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID!'); // match with handleCastError
  // }

  const user = await User.isUserExistsByEmail(userData.email);

  const allAgreementQuery = new QueryBuilder(
    Agreement.find({ tenant: user!._id }).populate('tenant rental landlord'),
    query,
  )
    .search(agreementSearchableFields)
    .filter()
    .range()
    .sort()
    .paginate()
    .fields();

  const data = await allAgreementQuery.modelQuery;
  const meta = await allAgreementQuery.countTotal();

  return {
    data,
    meta,
  };
};

// update Agreement Status by id
const updateAgreementStatusInDB = async (
  agreementId: string,
  statusData: { status: string },
  userData: JwtPayload,
) => {
  // checking if the Agreement is exist
  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Agreement not found!');
  }

  // checking if the Agreement is already deleted
  const isDeleted = agreement?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This Agreement is already deleted!',
    );
  }

  const originalLandlord = await User.findById(agreement.landlord);

  if (originalLandlord?.email !== userData.email) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this Agreement!',
    );
  }

  // making the Rental as isRented: true
  const rental = await Rental.findById(agreement.rental);
  if (!rental) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Rental not found!');
  }

  // checking if the rental is already deleted
  if (rental?.isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This Rental is already deleted!',
    );
  }

  // checking if the rental is already rented
  if (rental.isRented) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This Rental is already rented!');
  }

  // checking if the tenant is exists
  const tenant = await User.findById(agreement.tenant);
  if (!tenant) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Tenant not found!');
  }
  // checking if the tenant is already deleted
  if (tenant.isDeleted) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Tenant is already deleted!');
  }

  // checking if the tenant is blocked
  const tenantStatus = tenant?.status;
  if (tenantStatus === 'blocked') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Tenant is already blocked!');
  }

  if (statusData.status === 'approved') {
    // update Rental isRented
    await rental.updateOne({ isRented: true });

    // sending tenant an email notification
    const resetUILink = `${config.manage_tenant_agreements_ui_page_link}`;
    sendEmail({
      subject: 'Agreement Approved Alert!',
      to: tenant.email,
      fileName: 'AgreementApprovedAlertForTenant.html',
      buttonLink: resetUILink,
      userName: tenant.name,
      rentalAddress: rental.location,
    });
  } else {
    await rental.updateOne({ isRented: false });
  }

  const result = await Agreement.findByIdAndUpdate(
    agreementId,
    { status: statusData.status },
    {
      new: true, // returns the updated document, lest it returns the old document
    },
  );

  return result;
};

// add Landlord Contact Number From DB
const addLandlordContactNumberFromDB = async (
  agreementId: string,
  contactData: { landlordContactNo: string },
  userData: JwtPayload,
) => {
  // checking if the Agreement is exist
  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Agreement not found!');
  }

  // checking if the Agreement is already deleted
  const isDeleted = agreement?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This Agreement is already deleted!',
    );
  }

  const originalLandlord = await User.findById(agreement.landlord);

  if (originalLandlord?.email !== userData.email) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this Agreement!',
    );
  }

  // making the Rental as isRented: true
  const rental = await Rental.findById(agreement.rental);
  if (!rental) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Rental not found!');
  }

  // checking if the rental is already deleted
  if (rental?.isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This Rental is already deleted!',
    );
  }

  const result = await Agreement.findByIdAndUpdate(
    agreementId,
    { landlordContactNo: contactData.landlordContactNo },
    {
      new: true, // returns the updated document, lest it returns the old document
    },
  );

  return result;
};

// delete Agreement by id
const deleteAgreementFromDB = async (agreementId: string) => {
  // checking if the Agreement is exist
  const agreement = await Agreement.findById(agreementId);
  if (!agreement) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Agreement not found!');
  }

  // checking if the Agreement is already deleted
  const isDeleted = agreement?.isDeleted;
  if (isDeleted) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'This Agreement is already deleted!',
    );
  } // no need to check as I told the model to hide the soft-deleted documents

  const rental = await Rental.findById(agreement.rental);
  if (!rental) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Rental not found!');
  }

  await rental.updateOne({ isRented: false });

  // soft delete - update the isDeleted field to true
  await agreement.updateOne({ isDeleted: true });
  return null;
};

export const AgreementService = {
  requestAgreementIntoDB,
  getAllAgreementsFromDB,
  getLandlordAgreementsFromDB,
  getTenantAgreementsFromDB,
  updateAgreementStatusInDB,
  addLandlordContactNumberFromDB,
  deleteAgreementFromDB,
};
