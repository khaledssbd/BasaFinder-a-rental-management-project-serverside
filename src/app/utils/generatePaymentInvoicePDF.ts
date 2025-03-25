import PDFDocument from 'pdfkit';
import axios from 'axios';
import config from '../config';
import { Types } from 'mongoose';
import AppError from '../errors/AppError';
import { StatusCodes } from 'http-status-codes';

/**
 * Generates a PDF invoice for an order.
 * @param {IOrder} order - The order object to generate the invoice for.
 * @returns {Promise<Buffer>} - The generated PDF as a Buffer.
 */

type TPayment = {
  _id: Types.ObjectId;
  createdAt: Date;
  user: { name: string };
  shippingAddress: string;
  paymentStatus: string;
  paymentMethod: string;
  products: {
    product?: { name: string };
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  discount: number;
  deliveryCharge: number;
  finalAmount: number;
};

export const generatePaymentInvoicePDF = async (
  payment: TPayment,
): Promise<Buffer> => {
  try {
    const logoUrl =
      'https://res.cloudinary.com/dbgrq28js/image/upload/v1736763971/logoipsum-282_ilqjfb_paw4if.png';

    // লোগো ইমেজ ডাউনলোড
    const response = await axios.get(logoUrl, { responseType: 'arraybuffer' });
    const logoBuffer = Buffer.from(response.data);

    // Promise return করা হচ্ছে
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        // Invoice details
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err: Error) => reject(err));

        // 🏷️ **Header Section with graphical design and logo**
        const logoWidth = 70; // Set the desired width for the logo
        const logoX = (doc.page.width - logoWidth) / 2; // Center the logo
        doc.image(logoBuffer, logoX, doc.y, { width: logoWidth });
        doc.moveDown(6); // Move down after the logo

        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .fillColor('#000000')
          .text('BasaFinder', { align: 'center' });
        doc.fontSize(10).text('Level-4, 34, Awal Centre, Banani, Dhaka', {
          align: 'center',
        });
        doc.fontSize(10).text(`Email: ${config.googleMailServiceEmail}`, {
          align: 'center',
        });
        doc.fontSize(10).text('Phone: + 06 223 456 678', { align: 'center' });
        doc.moveDown(0.5);
        doc
          .fontSize(15)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Invoice', { align: 'center' });
        doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Horizontal line under header
        doc.moveDown(0.5);

        // 🏷️ **Invoice Details**
        doc
          .fontSize(11)
          .fillColor('#000000')
          .text(`Invoice ID: ${payment._id}`);
        doc.text(
          `Order Date: ${(payment.createdAt as Date).toLocaleDateString()}`,
        );
        doc.moveDown(0.5);

        // Customer Details with graphical design
        doc.text(`Customer Name: ${payment.user.name}`);
        doc.text(`Shipping Address: ${payment.shippingAddress}`);
        doc.moveDown(1);

        // 🏷️ **Payment Details with graphical design**
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Payment Details:', { underline: true });
        doc.text(`Payment Status: ${payment.paymentStatus}`);
        doc.text(`Payment Method: ${payment.paymentMethod}`);
        doc.moveDown(1);
        // doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();  // Horizontal line

        // // Order Products in a table format
        // doc.moveDown(2);
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Order Products:', { underline: true });
        doc.moveDown(1);

        const tableTop = doc.y;
        const tableHeight = 20;

        // Table Headers for Products (Bold and Colored)
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Product Name', 50, tableTop);
        doc.text('Quantity', 300, tableTop);
        doc.text('Price', 450, tableTop);

        doc
          .lineWidth(0.5)
          .moveTo(50, tableTop + tableHeight)
          .lineTo(550, tableTop + tableHeight)
          .stroke(); // Table header line
        let currentY = tableTop + tableHeight + 5;

        // Order Products (Normal text, not bold)
        payment.products.forEach((item) => {
          // payment details
          const productName = item.product?.name || 'Unknown Product';
          const quantity = item.quantity;
          // payment price
          const price = item.unitPrice * quantity || 0;

          doc
            .fontSize(11)
            .fillColor('#000000')
            .text(productName, 50, currentY, { width: 130, align: 'left' });
          doc.text(quantity.toString(), 280, currentY, {
            width: 90,
            align: 'center',
          });
          doc.text(price.toFixed(2), 400, currentY, {
            width: 90,
            align: 'right',
          });
          currentY += tableHeight;
        });

        // Final Table Border
        doc.lineWidth(0.5).moveTo(50, currentY).lineTo(550, currentY).stroke();

        doc.moveDown(2);

        const pricingTableTop = doc.y;

        // Table Headers for Pricing (Bold and Colored)
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Description', 50, pricingTableTop);
        doc.text('Amount', 450, pricingTableTop);

        doc
          .lineWidth(0.5)
          .moveTo(50, pricingTableTop + tableHeight)
          .lineTo(550, pricingTableTop + tableHeight)
          .stroke(); // Pricing header line
        let pricingY = pricingTableTop + tableHeight + 5;

        // Pricing Breakdown (Normal text, not bold)
        doc
          .fontSize(11)
          .fillColor('#000000')
          .text('Sub Total', 50, pricingY, { width: 200 });
        doc.text(`${payment.totalAmount.toFixed(2)} /-`, 400, pricingY, {
          width: 90,
          align: 'right',
        });
        pricingY += tableHeight;

        doc
          .fontSize(11)
          .fillColor('#000000')
          .text('Discount', 50, pricingY, { width: 200 });
        doc.text(`-${payment.discount.toFixed(2)} /-`, 400, pricingY, {
          width: 90,
          align: 'right',
        });
        pricingY += tableHeight;

        doc
          .fontSize(11)
          .fillColor('#000000')
          .text('Delivery Charge', 50, pricingY, { width: 200 });
        doc.text(`${payment.deliveryCharge.toFixed(2)} /-`, 400, pricingY, {
          width: 90,
          align: 'right',
        });
        pricingY += tableHeight;

        // Final Amount (Bold and Color)
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('Total', 50, pricingY, { width: 200 });
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text(`${payment.finalAmount.toFixed(2)} /-`, 400, pricingY, {
            width: 90,
            align: 'right',
          });
        pricingY += tableHeight;

        // Final Pricing Table Border
        doc.lineWidth(0.5).moveTo(50, pricingY).lineTo(550, pricingY).stroke();

        doc.moveDown(3);
        doc.fontSize(9).text('Thank you for shopping!');
        doc
          .fontSize(9)
          .fillColor('#003366')
          .text('-BasaFinder', { align: 'center' });
        // Finalize the document
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(
        StatusCodes.PRECONDITION_FAILED,
        `PDF generation failed: ${error.message}`,
      );
    } else {
      throw new AppError(
        StatusCodes.PRECONDITION_FAILED,
        'PDF generation failed: Unknown error',
      );
    }
  }
};
