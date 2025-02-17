import { Test, TestingModule } from '@nestjs/testing';
import { EvolutionService } from '../../services/evolution.service';
import { SocketService } from '../../services/socket.service';
import { LoggerService } from '../../services/logger.service';
import { WebhookEvent, Message } from '../../types/evolution';
import { AppError } from '../../utils/errors';

describe('EvolutionService', () => {
    let service: EvolutionService;
    let socketService: SocketService;
    let loggerService: LoggerService;

    const mockSocketService = {
        server: {
            emit: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
        },
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EvolutionService,
                {
                    provide: SocketService,
                    useValue: mockSocketService,
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService,
                },
            ],
        }).compile();

        service = module.get<EvolutionService>(EvolutionService);
        socketService = module.get<SocketService>(SocketService);
        loggerService = module.get<LoggerService>(LoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const message: Message = {
                id: '1',
                content: 'Test message',
                sender: 'user1',
                timestamp: new Date(),
                type: 'text'
            };

            mockSocketService.server.emit.mockImplementation((event, data) => {
                if (event === 'message:send') {
                    setTimeout(() => {
                        mockSocketService.server.emit('message:sent', {
                            messageId: data.messageId,
                            status: 'sent'
                        });
                    }, 100);
                }
            });

            await expect(service.sendMessage(message)).resolves.not.toThrow();
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('message:send', expect.any(Object));
        });

        it('should handle message send timeout', async () => {
            const message: Message = {
                id: '1',
                content: 'Test message',
                sender: 'user1',
                timestamp: new Date(),
                type: 'text'
            };

            mockSocketService.server.emit.mockImplementation(() => {});

            await expect(service.sendMessage(message)).rejects.toThrow(AppError);
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('message:send', expect.any(Object));
        });
    });

    describe('assignChat', () => {
        it('should assign chat successfully', async () => {
            const params = {
                ticketId: '1',
                agentId: 'agent1',
                departmentId: 'dept1'
            };

            mockSocketService.server.emit.mockImplementation((event, data) => {
                if (event === 'chat:assign') {
                    setTimeout(() => {
                        mockSocketService.server.emit('chat:assigned', {
                            ticketId: data.ticketId,
                            success: true
                        });
                    }, 100);
                }
            });

            await expect(service.assignChat(params)).resolves.not.toThrow();
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('chat:assign', expect.any(Object));
        });

        it('should handle chat assignment timeout', async () => {
            const params = {
                ticketId: '1',
                agentId: 'agent1',
                departmentId: 'dept1'
            };

            mockSocketService.server.emit.mockImplementation(() => {});

            await expect(service.assignChat(params)).rejects.toThrow(AppError);
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('chat:assign', expect.any(Object));
        });
    });

    describe('handleWebhookEvent', () => {
        it('should handle message webhook event', async () => {
            const event: WebhookEvent = {
                type: 'message',
                instance: 'instance1',
                timestamp: new Date(),
                data: {
                    id: '1',
                    from: 'user1',
                    content: 'Test message'
                }
            };

            await service.handleWebhookEvent(event);
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('message:received', expect.any(Object));
        });

        it('should handle status webhook event', async () => {
            const event: WebhookEvent = {
                type: 'status',
                instance: 'instance1',
                timestamp: new Date(),
                data: {
                    messageId: '1',
                    status: 'delivered'
                }
            };

            await service.handleWebhookEvent(event);
            expect(mockSocketService.server.emit).toHaveBeenCalledWith('message:status', expect.any(Object));
        });
    });
});
