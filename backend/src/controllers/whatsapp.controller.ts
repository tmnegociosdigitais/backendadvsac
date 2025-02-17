import { Request, Response } from 'express';
import { WhatsAppSessionService } from '../services/whatsapp-session.service';
import { logger } from '../config/logger';

class WhatsAppController {
    constructor(private sessionService: WhatsAppSessionService) {}

    async getAllSessions(req: Request, res: Response) {
        try {
            const sessions = this.sessionService.getAllSessions();
            res.json(sessions);
        } catch (error) {
            logger.error('Error getting sessions:', error);
            res.status(500).json({ error: 'Failed to get sessions' });
        }
    }

    async createSession(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const ownerId = req.user.id; // Assumindo que temos o usuário no request após autenticação
            const session = await this.sessionService.createSession(name, ownerId);
            res.json(session);
        } catch (error) {
            logger.error('Error creating session:', error);
            res.status(500).json({ error: 'Failed to create session' });
        }
    }

    async connectSession(req: Request, res: Response) {
        try {
            const { instanceId } = req.params;
            const qrResponse = await this.sessionService.connectSession(instanceId);
            res.json(qrResponse);
        } catch (error) {
            logger.error('Error connecting session:', error);
            res.status(500).json({ error: 'Failed to connect session' });
        }
    }

    async disconnectSession(req: Request, res: Response) {
        try {
            const { instanceId } = req.params;
            await this.sessionService.disconnectSession(instanceId);
            res.json({ success: true });
        } catch (error) {
            logger.error('Error disconnecting session:', error);
            res.status(500).json({ error: 'Failed to disconnect session' });
        }
    }

    async getSessionStatus(req: Request, res: Response) {
        try {
            const { instanceId } = req.params;
            const session = this.sessionService.getSession(instanceId);
            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }
            res.json({
                status: session.status,
                connectionInfo: session.connectionInfo,
                lastConnection: session.lastConnection
            });
        } catch (error) {
            logger.error('Error getting session status:', error);
            res.status(500).json({ error: 'Failed to get session status' });
        }
    }
}

export default new WhatsAppController(new WhatsAppSessionService());
