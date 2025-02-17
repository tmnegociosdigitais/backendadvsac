import { Router } from 'express';
import whatsappController from '../controllers/whatsapp.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas de instância
router.get('/instances/:instanceName', whatsappController.getInstance);
router.post('/instances', whatsappController.createInstance);
router.post('/instances/:instanceName/connect', whatsappController.connectInstance);
router.post('/instances/:instanceName/disconnect', whatsappController.disconnectInstance);

// Rotas de mensagens
router.post('/instances/:instanceName/messages', whatsappController.sendMessage);

// Rotas de grupos
router.post('/instances/:instanceName/groups', whatsappController.createGroup);
router.get('/instances/:instanceName/groups/:groupId', whatsappController.getGroupInfo);

// Rotas de webhook
router.post('/instances/:instanceName/webhook', whatsappController.updateWebhook);

export default router;
