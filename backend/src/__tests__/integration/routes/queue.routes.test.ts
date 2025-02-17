import request from 'supertest';
import { app } from '../../../app';
import queueService from '../../../services/queue.service';
import { MessagePriority, Message } from '../../../types/evolution';
import { logger } from '../../../config/logger';
import { AppDataSource } from '../../../config/database.config';

describe('Queue Routes', () => {
    const departmentId = 'test-department';
    const mockMessage: Message = {
        id: 'msg-1',
        content: 'Test message',
        from: '123456789',
        to: 'test-instance',
        timestamp: new Date(),
        type: 'text' as const,
        status: 'received' as const
    };

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        await queueService.clearQueue(departmentId);
    });

    describe('POST /api/queues/enqueue', () => {
        it('should enqueue a message', async () => {
            const response = await request(app)
                .post('/api/queues/enqueue')
                .send({
                    message: mockMessage,
                    departmentId,
                    priority: MessagePriority.NORMAL
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);

            const queueLength = await queueService.getQueueLength(departmentId);
            expect(queueLength).toBe(1);
        });

        it('should return 400 for invalid message', async () => {
            const response = await request(app)
                .post('/api/queues/enqueue')
                .send({
                    message: { invalid: 'message' },
                    departmentId
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/queues/update-priority', () => {
        it('should update message priority', async () => {
            await queueService.enqueue(mockMessage, departmentId);

            const response = await request(app)
                .post('/api/queues/update-priority')
                .send({
                    messageId: mockMessage.id,
                    departmentId,
                    priority: MessagePriority.HIGH
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);

            const distribution = await queueService.getPriorityDistribution(departmentId);
            expect(distribution[MessagePriority.HIGH]).toBe(1);
        });

        it('should return 404 for non-existent message', async () => {
            const response = await request(app)
                .post('/api/queues/update-priority')
                .send({
                    messageId: 'non-existent',
                    departmentId,
                    priority: MessagePriority.HIGH
                });

            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/queues/metrics/:departmentId', () => {
        it('should return queue metrics', async () => {
            await queueService.enqueue(mockMessage, departmentId);

            const response = await request(app)
                .get(`/api/queues/metrics/${departmentId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('queueLength', 1);
            expect(response.body).toHaveProperty('activeChatsCount');
            expect(response.body).toHaveProperty('priorityDistribution');
        });

        it('should return empty metrics for non-existent department', async () => {
            const response = await request(app)
                .get('/api/queues/metrics/non-existent');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('queueLength', 0);
            expect(response.body).toHaveProperty('activeChatsCount', 0);
            expect(response.body).toHaveProperty('priorityDistribution');
        });
    });
});
