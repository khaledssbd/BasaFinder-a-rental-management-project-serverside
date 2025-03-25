/* eslint-disable no-console */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
const ReadFile = promisify(fs.readFile);
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';
import AppError from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

const sendEmail = async (
  email: string,
  html: string,
  subject: string,
  attachment?: { filename: string; content: Buffer; encoding: string },
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: config.googleMailServiceEmail,
        pass: config.googleMailServicePass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Email configuration
    const mailOptions: nodemailer.SendMailOptions = {
      from: `${config.preffered_website_name} 🏡 <${config.googleMailServiceEmail}>`,
      to: email,
      subject,
      html,
    };

    if (attachment) {
      mailOptions.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
          encoding: attachment.encoding,
        },
      ];
    }

    // Sending the email
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError(
      StatusCodes.PRECONDITION_FAILED,
      'Failed to send email!',
    );
  }
};

const createEmailContent = async (data: object, templateType: string) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      `/src/templates/${templateType}.template.hbs`,
    );
    const content = await ReadFile(templatePath, 'utf8');

    const template = Handlebars.compile(content);

    return template(data);
  } catch (error) {
    console.error('Error creating email content:', error);
  }
};

export const EmailHelper = {
  sendEmail,
  createEmailContent,
};
