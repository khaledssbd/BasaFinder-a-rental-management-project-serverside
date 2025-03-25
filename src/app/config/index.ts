import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV,
  database_url: process.env.DATABASE_URL,
  port: process.env.PORT,

  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,

  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,

  googleMailServiceEmail: process.env.GOOGLE_MAIL_SERVICE_EMAIL,
  googleMailServicePass: process.env.GOOGLE_MAIL_SERVICE_PASSWORD,

  reset_pass_ui_page_link: process.env.RESET_PASS_UI_PAGE_LINK,

  manage_landlord_agreements_ui_page_link:
    process.env.MANAGE_LANDLORD_AGREEMENTS_UI_PAGE_LINK,

  manage_tenant_agreements_ui_page_link:
    process.env.MANAGE_TENANT_AGREEMENTS_UI_PAGE_LINK,

  preffered_website_name: process.env.PREFFERED_WEBSITE_NAME,

  jwt: {
    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
    jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    jwt_pass_reset_secret: process.env.JWT_PASS_RESET_SECRET,
    jwt_pass_reset_secret_expires_in:
      process.env.JWT_PASS_RESET_SECRET_EXPIRES_IN,
  },

  sp: {
    sp_endpoint: process.env.SP_ENDPOINT,
    sp_username: process.env.SP_USERNAME,
    sp_password: process.env.SP_PASSWORD,
    sp_prefix: process.env.SP_PREFIX,
    sp_return_url: process.env.SP_RETURN_URL,
  },

  ssl: {
    store_name: process.env.STORE_NAME,
    payment_api: process.env.PAYMENT_API,
    validation_api: process.env.VALIDATION_API,
    store_id: process.env.STORE_ID,
    store_pass: process.env.STORE_PASSWORD,
    validation_url: process.env.VALIDATION_URL,
    // success_url: process.env.SUCCESS_URL,
    failed_url: process.env.FAILED_URL,
    cancel_url: process.env.CANCEL_URL,
  },
};
