import { Request, Response } from 'express';
import queueService from '../services/queue.service';
import { AppError } from '../errors/AppError';

class QueueController {
    async enqueue(req: Request, res: Response) {
        try {
            const { message, departmentId, priority } = req.body;
            await queueService.enqueue(message, departmentId, priority);
            res.json({ success: true });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async updatePriority(req: Request, res: Response) {
        try {
            const { messageId, departmentId, priority } = req.body;
            await queueService.updatePriority(messageId, departmentId, priority);
            res.json({ success: true });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    async getMetrics(req: Request, res: Response) {
        try {
            const { departmentId } = req.params;
            
            const [queueLength, activeChatsCount, priorityDistribution] = await Promise.all([
                queueService.getQueueLength(departmentId),
                queueService.getActiveChatsCount(departmentId),
                queueService.getPriorityDistribution(departmentId)
            ]);

            res.json({
                queueLength,
                activeChatsCount,
                priorityDistribution
            });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}

export default new QueueController();
