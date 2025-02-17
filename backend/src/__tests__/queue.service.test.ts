import { QueueService } from '../services/queue.service';
import { Message } from '../entities/message.entity';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { app } from '../app';

describe('Queue Service', () => {
    let queueService: QueueService;
    let io: Server;
    let httpServer: any;

    beforeAll(() => {
        httpServer = createServer(app);
        io = new Server(httpServer);
        queueService = new QueueService(io);
    });

    afterAll(() => {
        io.close();
        httpServer.close();
    });

    beforeEach(() => {
        // Limpa a fila antes de cada teste
        queueService.clearQueue();
    });

    describe('enqueue', () => {
        it('deve adicionar mensagem à fila com prioridade correta', () => {
            const mockMessage: Partial<Message> = {
                id: '123',
                content: 'Teste',
                sender: 'user123',
                type: 'text',
                department: { id: 'dept123', name: 'Suporte' } as any
            };

            queueService.enqueue(mockMessage as Message, 'high');
            
            const queueState = queueService.getQueueState('dept123');
            expect(queueState.queueLength).toBe(1);
            expect(queueState.priorityDistribution.high).toBe(1);
        });

        it('deve ordenar mensagens por prioridade', () => {
            const msg1: Partial<Message> = {
                id: '1',
                department: { id: 'dept123' } as any
            };
            const msg2: Partial<Message> = {
                id: '2',
                department: { id: 'dept123' } as any
            };

            queueService.enqueue(msg1 as Message, 'low');
            queueService.enqueue(msg2 as Message, 'high');

            const nextMessage = queueService.dequeue('dept123');
            expect(nextMessage?.id).toBe('2'); // Deve retornar a mensagem de alta prioridade primeiro
        });
    });

    describe('dequeue', () => {
        it('deve remover e retornar a próxima mensagem da fila', () => {
            const mockMessage: Partial<Message> = {
                id: '123',
                department: { id: 'dept123' } as any
            };

            queueService.enqueue(mockMessage as Message, 'normal');
            const dequeuedMessage = queueService.dequeue('dept123');

            expect(dequeuedMessage?.id).toBe('123');
            expect(queueService.getQueueState('dept123').queueLength).toBe(0);
        });

        it('deve retornar null quando a fila estiver vazia', () => {
            const message = queueService.dequeue('dept123');
            expect(message).toBeNull();
        });
    });

    describe('getQueueState', () => {
        it('deve retornar métricas corretas da fila', () => {
            const msg1: Partial<Message> = {
                id: '1',
                department: { id: 'dept123' } as any
            };
            const msg2: Partial<Message> = {
                id: '2',
                department: { id: 'dept123' } as any
            };

            queueService.enqueue(msg1 as Message, 'high');
            queueService.enqueue(msg2 as Message, 'low');

            const metrics = queueService.getQueueState('dept123');
            expect(metrics.queueLength).toBe(2);
            expect(metrics.priorityDistribution.high).toBe(1);
            expect(metrics.priorityDistribution.low).toBe(1);
        });
    });
});