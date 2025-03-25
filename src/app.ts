import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import os from 'os';
import { StatusCodes } from 'http-status-codes';
import config from './app/config';

const app: Application = express();

const corsConfig = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://basafinder-clientside.vercel.app',
  ],
  credentials: true,
};

// parsers
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // for "Content-Type": "application/x-www-form-urlencoded" (ex: used in NextMert- reCaptchaTokenVerification action)

// app.get('/', (req: Request, res: Response) => {
//   res.send(`Hi, Welcome to the ${config.preffered_website_name}! 🏡  ✨  ⚡`);
// });

app.get('/', (req: Request, res: Response) => {
  const currentDateTime = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const serverHostname = os.hostname();
  const serverPlatform = os.platform();
  const serverUptime = os.uptime();

  res.status(StatusCodes.OK).json({
    success: true,
    message: `Welcome to the ${config.preffered_website_name}! 🏡  ✨  ⚡`,
    version: '1.0.0',
    clientDetails: {
      ipAddress: clientIp,
      accessedAt: currentDateTime,
    },
    serverDetails: {
      hostname: serverHostname,
      platform: serverPlatform,
      uptime: `${Math.floor(serverUptime / 60 / 60)} hours ${Math.floor(
        (serverUptime / 60) % 60,
      )} minutes`,
    },
    developerContact: {
      email: 'khaledssbd@gmail.com',
      website: 'https://khaled-siddique.vercel.app',
    },
  });
});

// all routes
app.use('/api/v1', router);

// global error handler
app.use(globalErrorHandler);

// not found route handler
app.use(notFound);

export default app;
