import { Router } from 'express';
import { RentalRoutes } from '../modules/rental/rental.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { AgreementRoutes } from '../modules/agreement/agreement.route';
import { PaymentRoutes } from '../modules/payment/payment.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/rentals',
    route: RentalRoutes,
  },
  {
    path: '/agreements',
    route: AgreementRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

// router.use('/auth', AuthRoutes);
// router.use('/users', UserRoutes);
// router.use('/rentals', RentalRoutes);
// router.use('/agreements', AgreementRoutes)
// router.use('/payments', PaymentRoutes)

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
