import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from './redis.service';
import { SocketService } from './socket.service';
import { LoggerService } from './logger.service';
import { UserService } from './user.service';
import { DepartmentService } from './department.service';
import { EvolutionService } from './evolution.service';
import {
    QueueConfig,
    QueueItem,
    QueueStatus,
    QueuePriority,
    QueueMetrics,
    AgentMetrics,
    QueueEvent,
    DistributionResult
} from '../types/queue.types';
import { User } from '../types/user.types';
import { Message } from '../types/message.types';
import { AppError } from '../utils/errors';

@Injectable()
export class QueueService {
    private readonly QUEUE_KEY = 'queue:items';
    private readonly METRICS_KEY = 'queue:metrics';
    private readonly AGENT_METRICS_KEY = 'queue:agent:metrics';
    private readonly SOCKET_NAMESPACE = 'attendance'; // Mantendo namespace existente

    constructor(
        @InjectRepository(QueueItem)
        private queueRepository: Repository<QueueItem>,
        private redisService: RedisService,
        private socketService: SocketService,
        private loggerService: LoggerService,
        private userService: UserService,
        private departmentService: DepartmentService,
        private evolutionService: EvolutionService
    ) {
        this.initializeQueueProcessing();
    }

    private initializeQueueProcessing(): void {
        // Processa a fila a cada 5 segundos
        setInterval(async () => {
            try {
                await this.processQueue();
            } catch (error) {
                this.loggerService.error('Erro ao processar fila', error);
            }
        }, 5000);
    }

    async addToQueue(
        message: Message,
        departmentId: string,
        priority: QueuePriority = QueuePriority.NORMAL
    ): Promise<QueueItem> {
        try {
            const queueItem: QueueItem = {
                id: `ticket-${Date.now()}`,
                ticketId: `T${Date.now()}`,
                departmentId,
                priority,
                enteredAt: new Date(),
                lastUpdate: new Date(),
                status: QueueStatus.WAITING,
                metadata: {
                    messageCount: 1,
                    firstMessage: message,
                    lastMessage: message,
                    source: 'whatsapp',
                    tags: []
                }
            };

            // Salva no Redis para acesso rápido
            await this.redisService.hSet(this.QUEUE_KEY, queueItem.id, JSON.stringify(queueItem));
            
            // Salva no banco de dados para persistência
            await this.queueRepository.save(queueItem);

            // Notifica via Socket.IO usando o namespace correto
            this.socketService.server.of(this.SOCKET_NAMESPACE).emit('queue:added', {
                queueItem,
                department: await this.departmentService.getDepartment(departmentId)
            });

            await this.updateMetrics();
            
            // Tenta distribuir o item imediatamente
            await this.distributeQueueItem(queueItem);

            return queueItem;
        } catch (error) {
            this.loggerService.error('Erro ao adicionar item à fila', error);
            throw new AppError('Erro ao adicionar item à fila', 500);
        }
    }

    private async processQueue(): Promise<void> {
        const items = await this.getAllQueueItems();
        const waitingItems = items.filter(item => item.status === QueueStatus.WAITING);

        for (const item of waitingItems) {
            try {
                await this.distributeQueueItem(item);
            } catch (error) {
                this.loggerService.error(`Erro ao processar item ${item.id}`, error);
            }
        }
    }

    private async distributeQueueItem(queueItem: QueueItem): Promise<DistributionResult> {
        const department = await this.departmentService.getDepartment(queueItem.departmentId);
        const config = department.queueConfig;

        if (!this.isWithinWorkingHours(config.workingHours)) {
            return {
                success: false,
                queueItem,
                error: 'Fora do horário de funcionamento'
            };
        }

        const availableAgents = await this.getAvailableAgents(queueItem.departmentId);
        if (availableAgents.length === 0) {
            return {
                success: false,
                queueItem,
                error: 'Nenhum agente disponível'
            };
        }

        const selectedAgent = await this.selectAgent(availableAgents, config.distributionRules);
        if (!selectedAgent) {
            return {
                success: false,
                queueItem,
                error: 'Não foi possível selecionar um agente'
            };
        }

        try {
            // Integração com Evolution API
            await this.evolutionService.assignChat({
                ticketId: queueItem.ticketId,
                agentId: selectedAgent.id,
                departmentId: queueItem.departmentId
            });

            queueItem.status = QueueStatus.ASSIGNED;
            queueItem.assignedTo = selectedAgent.id;
            queueItem.lastUpdate = new Date();

            await this.redisService.hSet(this.QUEUE_KEY, queueItem.id, JSON.stringify(queueItem));
            await this.queueRepository.save(queueItem);

            // Notifica via Socket.IO usando o namespace correto
            this.socketService.server.of(this.SOCKET_NAMESPACE).emit('queue:assigned', {
                queueItem,
                department,
                agent: selectedAgent
            });

            await this.updateMetrics();

            return {
                success: true,
                queueItem,
                assignedTo: selectedAgent
            };
        } catch (error) {
            this.loggerService.error('Erro ao atribuir chat', error);
            throw new AppError('Erro ao atribuir chat', 500);
        }
    }

    private async selectAgent(agents: User[], rules: QueueConfig['distributionRules']): Promise<User | null> {
        const agentMetrics = await this.getAgentMetrics(agents.map(a => a.id));
        
        switch (rules.method) {
            case 'roundRobin':
                return this.selectAgentRoundRobin(agents, agentMetrics);
            case 'leastBusy':
                return this.selectAgentLeastBusy(agents, agentMetrics);
            case 'random':
                return agents[Math.floor(Math.random() * agents.length)];
            default:
                return null;
        }
    }

    private async selectAgentRoundRobin(agents: User[], metrics: AgentMetrics[]): Promise<User> {
        const lastAssignedIndex = await this.redisService.get('queue:lastAssignedIndex') || '-1';
        const nextIndex = (parseInt(lastAssignedIndex) + 1) % agents.length;
        await this.redisService.set('queue:lastAssignedIndex', nextIndex.toString());
        return agents[nextIndex];
    }

    private async selectAgentLeastBusy(agents: User[], metrics: AgentMetrics[]): Promise<User> {
        return agents.reduce((prev, curr) => {
            const prevMetrics = metrics.find(m => m.agentId === prev.id);
            const currMetrics = metrics.find(m => m.agentId === curr.id);
            return (prevMetrics?.activeChats || 0) <= (currMetrics?.activeChats || 0) ? prev : curr;
        });
    }

    private async getAvailableAgents(departmentId: string): Promise<User[]> {
        const agents = await this.userService.getDepartmentAgents(departmentId);
        const metrics = await this.getAgentMetrics(agents.map(a => a.id));
        
        return agents.filter(agent => {
            const agentMetrics = metrics.find(m => m.agentId === agent.id);
            return agentMetrics?.status === 'online' && 
                   (agentMetrics?.activeChats || 0) < agent.maxConcurrentChats;
        });
    }

    private async updateMetrics(): Promise<void> {
        const items = await this.getAllQueueItems();
        const metrics: QueueMetrics = {
            totalItems: items.length,
            waitingItems: items.filter(i => i.status === QueueStatus.WAITING).length,
            processingItems: items.filter(i => i.status === QueueStatus.PROCESSING).length,
            assignedItems: items.filter(i => i.status === QueueStatus.ASSIGNED).length,
            averageWaitTime: this.calculateAverageWaitTime(items),
            currentLoad: this.calculateCurrentLoad(items),
            agentMetrics: await this.getAgentMetrics()
        };

        await this.redisService.set(this.METRICS_KEY, JSON.stringify(metrics));
        this.socketService.server.of(this.SOCKET_NAMESPACE).emit('queue:metrics', metrics);
    }

    private async emitQueueEvent(
        type: QueueEvent['type'],
        queueItem: QueueItem,
        agent?: User
    ): Promise<void> {
        const department = await this.departmentService.getDepartment(queueItem.departmentId);
        const event: QueueEvent = {
            type,
            queueItem,
            department,
            agent,
            timestamp: new Date()
        };

        this.socketService.server.of(this.SOCKET_NAMESPACE).emit('queue:event', event);
        this.loggerService.info('Queue event emitted', { event });
    }

    private isWithinWorkingHours(workingHours: QueueConfig['workingHours']): boolean {
        const now = new Date();
        const day = now.getDay();
        
        if (!workingHours.workDays.includes(day)) {
            return false;
        }

        const [startHour, startMinute] = workingHours.start.split(':').map(Number);
        const [endHour, endMinute] = workingHours.end.split(':').map(Number);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        const currentTime = currentHour * 60 + currentMinute;

        return currentTime >= startTime && currentTime <= endTime;
    }

    async getQueueMetrics(): Promise<QueueMetrics> {
        const metricsStr = await this.redisService.get(this.METRICS_KEY);
        return metricsStr ? JSON.parse(metricsStr) : null;
    }

    async getQueueItem(id: string): Promise<QueueItem | null> {
        const itemStr = await this.redisService.hGet(this.QUEUE_KEY, id);
        return itemStr ? JSON.parse(itemStr) : null;
    }

    async getAllQueueItems(): Promise<QueueItem[]> {
        const items = await this.redisService.hGetAll(this.QUEUE_KEY);
        return Object.values(items).map(item => JSON.parse(item));
    }

    async closeQueueItem(id: string, resolution: string): Promise<void> {
        const item = await this.getQueueItem(id);
        if (!item) return;

        item.status = QueueStatus.CLOSED;
        item.lastUpdate = new Date();
        
        await this.redisService.hSet(this.QUEUE_KEY, id, JSON.stringify(item));
        await this.queueRepository.save(item);

        this.socketService.server.of(this.SOCKET_NAMESPACE).emit('queue:closed', {
            queueItem: item,
            department: await this.departmentService.getDepartment(item.departmentId)
        });

        await this.updateMetrics();
    }

    private calculateAverageWaitTime(items: QueueItem[]): number {
        const waitingItems = items.filter(i => i.status === QueueStatus.WAITING);
        if (waitingItems.length === 0) return 0;

        const totalWaitTime = waitingItems.reduce((sum, item) => {
            return sum + (Date.now() - item.enteredAt.getTime());
        }, 0);

        return Math.floor(totalWaitTime / waitingItems.length / 1000); // em segundos
    }

    private calculateCurrentLoad(items: QueueItem[]): number {
        const activeItems = items.filter(i => 
            i.status === QueueStatus.WAITING || 
            i.status === QueueStatus.PROCESSING
        ).length;

        // Assumindo uma capacidade máxima baseada no número de agentes e seus limites
        const maxCapacity = 100; // Este valor deve ser calculado dinamicamente
        return Math.min((activeItems / maxCapacity) * 100, 100);
    }

    async handleEvolutionWebhook(payload: any): Promise<void> {
        try {
            // Lógica para processar webhooks da Evolution API
            const { type, data } = payload;
            
            switch (type) {
                case 'message':
                    await this.handleNewMessage(data);
                    break;
                case 'status':
                    await this.handleStatusUpdate(data);
                    break;
                // ... outros casos
            }
        } catch (error) {
            this.loggerService.error('Erro ao processar webhook', error);
            throw new AppError('Erro ao processar webhook', 500);
        }
    }

    private async handleNewMessage(data: any): Promise<void> {
        // Implementar lógica de processamento de novas mensagens
    }

    private async handleStatusUpdate(data: any): Promise<void> {
        // Implementar lógica de atualização de status
    }
}
