import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LoggerService } from './logger.service';
import { QueueItem, QueueConfig } from '../types/queue.types';
import { User } from '../types/user.types';
import { AgentPerformance, DistributionStrategy } from '../types/queue-distribution';

@Injectable()
export class QueueDistributionService {
    private readonly PERFORMANCE_KEY = 'queue:agent:performance';
    private readonly HISTORY_KEY = 'queue:distribution:history';

    constructor(
        private redisService: RedisService,
        private logger: LoggerService
    ) {}

    async selectBestAgent(
        agents: User[], 
        queueItem: QueueItem,
        config: QueueConfig['distributionRules']
    ): Promise<User | null> {
        try {
            if (agents.length === 0) return null;

            // Obtém métricas de performance dos agentes
            const performances = await this.getAgentsPerformance(agents.map(a => a.id));
            
            // Filtra agentes com base em capacidade e status
            const availableAgents = this.filterAvailableAgents(agents, performances);
            if (availableAgents.length === 0) return null;

            // Seleciona o melhor agente baseado na estratégia configurada
            const selectedAgent = await this.applyDistributionStrategy(
                availableAgents,
                performances,
                queueItem,
                config
            );

            if (selectedAgent) {
                await this.updateDistributionHistory(selectedAgent.id, queueItem.id);
            }

            return selectedAgent;
        } catch (error) {
            this.logger.error('Erro ao selecionar agente:', error);
            return null;
        }
    }

    private filterAvailableAgents(
        agents: User[], 
        performances: AgentPerformance[]
    ): User[] {
        return agents.filter(agent => {
            const performance = performances.find(p => p.agentId === agent.id);
            if (!performance) return true; // Se não tem métricas, considera disponível

            return (
                performance.status === 'online' &&
                performance.activeChats < agent.maxConcurrentChats &&
                performance.currentLoad < 0.8 // 80% de carga máxima
            );
        });
    }

    private async applyDistributionStrategy(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem,
        config: QueueConfig['distributionRules']
    ): Promise<User | null> {
        const strategy = this.getDistributionStrategy(config.method);
        return strategy.selectAgent(agents, performances, queueItem);
    }

    private getDistributionStrategy(method: string): DistributionStrategy {
        switch (method) {
            case 'performance':
                return new PerformanceBasedStrategy();
            case 'skillBased':
                return new SkillBasedStrategy();
            case 'hybrid':
                return new HybridStrategy();
            default:
                return new RoundRobinStrategy();
        }
    }

    async updateAgentPerformance(agentId: string, metrics: Partial<AgentPerformance>): Promise<void> {
        const performances = await this.getAgentsPerformance([agentId]);
        const current = performances.find(p => p.agentId === agentId) || {
            agentId,
            activeChats: 0,
            averageResponseTime: 0,
            resolutionRate: 0,
            satisfactionScore: 0,
            currentLoad: 0,
            status: 'online'
        };

        const updated = { ...current, ...metrics };
        await this.redisService.hSet(this.PERFORMANCE_KEY, agentId, JSON.stringify(updated));
    }

    async getAgentsPerformance(agentIds: string[]): Promise<AgentPerformance[]> {
        const performances: AgentPerformance[] = [];
        
        for (const agentId of agentIds) {
            const data = await this.redisService.hGet(this.PERFORMANCE_KEY, agentId);
            if (data) {
                performances.push(JSON.parse(data));
            }
        }

        return performances;
    }

    private async updateDistributionHistory(agentId: string, ticketId: string): Promise<void> {
        const history = {
            agentId,
            ticketId,
            timestamp: Date.now()
        };

        await this.redisService.rPush(this.HISTORY_KEY, JSON.stringify(history));
        // Mantém apenas os últimos 1000 registros
        await this.redisService.lTrim(this.HISTORY_KEY, -1000, -1);
    }

    async getDistributionHistory(limit: number = 100): Promise<any[]> {
        const data = await this.redisService.lRange(this.HISTORY_KEY, -limit, -1);
        return data.map(item => JSON.parse(item));
    }

    // Método para calcular carga de trabalho do agente
    private calculateAgentLoad(performance: AgentPerformance): number {
        const {
            activeChats,
            averageResponseTime,
            resolutionRate,
            satisfactionScore
        } = performance;

        // Pesos para cada métrica
        const weights = {
            activeChats: 0.4,
            responseTime: 0.2,
            resolutionRate: 0.2,
            satisfaction: 0.2
        };

        // Normaliza cada métrica para uma escala de 0-1
        const normalizedChats = activeChats / 10; // Assume max 10 chats
        const normalizedResponseTime = Math.min(averageResponseTime / 300, 1); // 5 min max
        const normalizedResolution = 1 - (resolutionRate / 100);
        const normalizedSatisfaction = 1 - (satisfactionScore / 5);

        // Calcula carga ponderada
        return (
            normalizedChats * weights.activeChats +
            normalizedResponseTime * weights.responseTime +
            normalizedResolution * weights.resolutionRate +
            normalizedSatisfaction * weights.satisfaction
        );
    }
}
