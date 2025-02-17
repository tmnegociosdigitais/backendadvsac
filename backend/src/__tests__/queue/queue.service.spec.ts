import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueService } from '../../services/queue.service';
import { RedisService } from '../../services/redis.service';
import { SocketService } from '../../services/socket.service';
import { LoggerService } from '../../services/logger.service';
import { UserService } from '../../services/user.service';
import { DepartmentService } from '../../services/department.service';
import { EvolutionService } from '../../services/evolution.service';
import { QueueItem, QueueStatus, QueuePriority } from '../../types/queue.types';
import { Message } from '../../types/message.types';

describe('QueueService', () => {
    let service: QueueService;
    let queueRepository: Repository<QueueItem>;
    let redisService: RedisService;
    let socketService: SocketService;
    let loggerService: LoggerService;
    let userService: UserService;
    let departmentService: DepartmentService;
    let evolutionService: EvolutionService;

    const mockQueueRepository = {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
    };

    const mockRedisService = {
        hSet: jest.fn(),
        hGet: jest.fn(),
        hGetAll: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
    };

    const mockSocketService = {
        server: {
            of: jest.fn().mockReturnThis(),
            emit: jest.fn(),
        },
    };

    const mockLoggerService = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    };

    const mockUserService = {
        getUser: jest.fn(),
        getUsers: jest.fn(),
    };

    const mockDepartmentService = {
        getDepartment: jest.fn(),
    };

    const mockEvolutionService = {
        assignChat: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                {
                    provide: getRepositoryToken(QueueItem),
                    useValue: mockQueueRepository,
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: SocketService,
                    useValue: mockSocketService,
                },
                {
                    provide: LoggerService,
                    useValue: mockLoggerService,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: DepartmentService,
                    useValue: mockDepartmentService,
                },
                {
                    provide: EvolutionService,
                    useValue: mockEvolutionService,
                },
            ],
        }).compile();

        service = module.get<QueueService>(QueueService);
        queueRepository = module.get<Repository<QueueItem>>(getRepositoryToken(QueueItem));
        redisService = module.get<RedisService>(RedisService);
        socketService = module.get<SocketService>(SocketService);
        loggerService = module.get<LoggerService>(LoggerService);
        userService = module.get<UserService>(UserService);
        departmentService = module.get<DepartmentService>(DepartmentService);
        evolutionService = module.get<EvolutionService>(EvolutionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addToQueue', () => {
        it('should add a message to the queue successfully', async () => {
            const message: Message = {
                id: '1',
                content: 'Test message',
                sender: 'user1',
                timestamp: new Date(),
                type: 'text'
            };

            const departmentId = 'dept1';
            const priority = QueuePriority.NORMAL;

            const expectedQueueItem = {
                id: expect.any(String),
                ticketId: expect.any(String),
                departmentId,
                priority,
                enteredAt: expect.any(Date),
                lastUpdate: expect.any(Date),
                status: QueueStatus.WAITING,
                metadata: {
                    messageCount: 1,
                    firstMessage: message,
                    lastMessage: message,
                    source: 'whatsapp',
                    tags: []
                }
            };

            mockRedisService.hSet.mockResolvedValue(true);
            mockQueueRepository.save.mockResolvedValue(expectedQueueItem);
            mockDepartmentService.getDepartment.mockResolvedValue({ id: departmentId, name: 'Test Department' });

            const result = await service.addToQueue(message, departmentId, priority);

            expect(result).toMatchObject(expectedQueueItem);
            expect(mockRedisService.hSet).toHaveBeenCalled();
            expect(mockQueueRepository.save).toHaveBeenCalled();
            expect(mockSocketService.server.emit).toHaveBeenCalled();
        });
    });
});
