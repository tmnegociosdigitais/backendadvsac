import { Router } from 'express';
import webhookController from '../controllers/webhook.controller';

const router = Router();

// Rota para receber webhooks da Evolution API
router.post('/', webhookController.handleWebhook);

export default router;
