import { Router } from 'express';
import authRoutes from './auth.routes';
import departmentRoutes from './department.routes';
import whatsappRoutes from './whatsapp.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
