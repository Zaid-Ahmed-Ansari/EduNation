import { Router } from 'express';
import countryRoutes from './countryRoutes.js';

const router = Router();

router.use('/', countryRoutes);

export default router;
