/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server | null = null;

// Database connection function
async function connectToDatabase() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('✅ Database connected successfully!  🛢');
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1); // Database কানেক্টেড না থাকলে অ্যাপ চালানোর দরকার নেই, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
  }
}

// Graceful shutdown function to close the server properly
function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Closing server... 🤷‍♂️ `);
  if (server) {
    server.close(() => {
      console.log('Server closed gracefully! ✅');
      process.exit(0); // সবকিছু ঠিকঠাক বন্ধ হলে অ্যাপ সম্পূর্ণভাবে বন্ধ করে দেওয়া হচ্ছে
    });
  } else {
    process.exit(0);
  }
}

// Application bootstrap function
async function main() {
  try {
    await connectToDatabase();
    // Seed function (অপশনাল, প্রয়োজনে চালু করুন)
    // await seed();

    server = app.listen(config.port, () => {
      console.log(`🚀 Application is running on port ${config.port}!  ✨  ⚡`);
    });

    // Listen for OS termination signals (Ctrl+C or server stop)
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handling uncaught exceptions (যদি কোডে কোনো অপ্রত্যাশিত ভুল হয়)
    process.on('uncaughtException', (error) => {
      console.error('😈 Uncaught Exception:', error);
      // সার্ভার চলছে, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
      gracefulShutdown('uncaughtException');
    });

    // Handling unhandled promise rejections (যদি কোনো প্রমিস রিজেক্ট হয় কিন্তু ক্যাচ করা না হয়)
    process.on('unhandledRejection', (error) => {
      console.error('😈 Unhandled Rejection:', error);
      // সার্ভার চলছে, তাই অ্যাপ বন্ধ করে দেওয়া হচ্ছে
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('😈 Error during bootstrap:', error);
    // যদি সার্ভার চালু না হয়, তাহলে অ্যাপ সাথে সাথে বন্ধ করে দেওয়া হবে
    process.exit(1);
  }
}

main();
