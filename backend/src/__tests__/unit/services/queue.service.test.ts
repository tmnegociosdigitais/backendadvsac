import queueService from '../../../services/queue.service';
import { MessagePriority, Message } from '../../../types/evolution';
import { io } from '../../../config/socket';
import { logger } from '../../../config/logger';
import { AppDataSource } from '../../../config/database.config';

// Mock do Socket.IO
jest.mock('../../../config/socket', () => ({
    io: {
        emit: jest.fn()
    }
}));

describe('QueueService', () => {
    const departmentId = 'test-department';
    const mockMessage: Message = {
        id: 'msg-1',
        content: 'Test message',
        from: '123456789',
        to: 'test-instance',
        timestamp: new Date(),
        type: 'text',
        status: 'received'
    };

    beforeAll(async () => {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }
        } catch (error) {
            logger.error('Erro ao inicializar banco de dados:', error);
            throw error;
        }
    });

    afterAll(async () => {
        try {
            if (AppDataSource.isInitialized) {
                await AppDataSource.destroy();
            }
        } catch (error) {
            logger.error('Erro ao fechar conexão:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        // Limpa o estado da fila antes de cada teste
        await queueService.clearQueue(departmentId);
        // Reseta os mocks
        jest.clearAllMocks();
    });

    describe('enqueue', () => {
        it('should add message to queue with default priority', async () => {
            await queueService.enqueue(mockMessage, departmentId);
            
            const queueLength = await queueService.getQueueLength(departmentId);
            expect(queueLength).toBe(1);
        });

        it('should add message with specified priority', async () => {
            await queueService.enqueue(mockMessage, departmentId, MessagePriority.HIGH);
            
            const distribution = await queueService.getPriorityDistribution(departmentId);
            expect(distribution[MessagePriority.HIGH]).toBe(1);
        });

        it('should emit socket event when message is added', async () => {
            await queueService.enqueue(mockMessage, departmentId);
            
            expect(io.emit).toHaveBeenCalledWith('queue:updated', expect.any(Object));
        });
    });

    describe('dequeue', () => {
        it('should remove and return message from queue', async () => {
            await queueService.enqueue(mockMessage, departmentId);
            
            const message = await queueService.dequeue(departmentId);
            expect(message).toBeDefined();
            expect(message?.id).toBe(mockMessage.id);
            
            const queueLength = await queueService.getQueueLength(departmentId);
            expect(queueLength).toBe(0);
        });

        it('should return null when queue is empty', async () => {
            const message = await queueService.dequeue(departmentId);
            expect(message).toBeNull();
        });
    });

    describe('updatePriority', () => {
        it('should update message priority', async () => {
            await queueService.enqueue(mockMessage, departmentId, MessagePriority.NORMAL);
            
            await queueService.updatePriority(mockMessage.id, departmentId, MessagePriority.HIGH);
            
            const distribution = await queueService.getPriorityDistribution(departmentId);
            expect(distribution[MessagePriority.HIGH]).toBe(1);
            expect(distribution[MessagePriority.NORMAL]).toBe(0);
        });

        it('should throw error for non-existent message', async () => {
            await expect(
                queueService.updatePriority('non-existent', departmentId, MessagePriority.HIGH)
            ).rejects.toThrow();
        });
    });

    describe('getQueueMetrics', () => {
        it('should return correct queue metrics', async () => {
            await queueService.enqueue(mockMessage, departmentId, MessagePriority.HIGH);
            await queueService.enqueue({ ...mockMessage, id: 'msg-2' }, departmentId, MessagePriority.NORMAL);
            
            const metrics = await queueService.getQueueMetrics(departmentId);
            
            expect(metrics.queueLength).toBe(2);
            expect(metrics.priorityDistribution[MessagePriority.HIGH]).toBe(1);
            expect(metrics.priorityDistribution[MessagePriority.NORMAL]).toBe(1);
        });

        it('should return empty metrics for non-existent department', async () => {
            const metrics = await queueService.getQueueMetrics('non-existent');
            
            expect(metrics.queueLength).toBe(0);
            expect(Object.values(metrics.priorityDistribution).every(count => count === 0)).toBe(true);
        });
    });
});
