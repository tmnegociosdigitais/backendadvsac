import { User } from './user.types';
import { QueueItem } from './queue.types';

export interface AgentPerformance {
    agentId: string;
    activeChats: number;
    averageResponseTime: number; // segundos
    resolutionRate: number; // porcentagem
    satisfactionScore: number; // 1-5
    currentLoad: number; // 0-1
    status: 'online' | 'busy' | 'away' | 'offline';
    skills?: string[];
    specialties?: string[];
    lastAssignment?: Date;
}

export interface DistributionStrategy {
    selectAgent(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem
    ): Promise<User | null>;
}

export class PerformanceBasedStrategy implements DistributionStrategy {
    async selectAgent(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem
    ): Promise<User | null> {
        return agents.reduce((best, current) => {
            const bestPerf = performances.find(p => p.agentId === best?.id);
            const currentPerf = performances.find(p => p.agentId === current.id);

            if (!bestPerf) return current;
            if (!currentPerf) return best;

            // Calcula score baseado em múltiplos fatores
            const bestScore = this.calculatePerformanceScore(bestPerf);
            const currentScore = this.calculatePerformanceScore(currentPerf);

            return currentScore > bestScore ? current : best;
        }, agents[0]);
    }

    private calculatePerformanceScore(performance: AgentPerformance): number {
        const {
            activeChats,
            averageResponseTime,
            resolutionRate,
            satisfactionScore,
            currentLoad
        } = performance;

        // Normaliza e pondera cada métrica
        const chatScore = (1 - (activeChats / 10)) * 0.2;
        const responseScore = (1 - (averageResponseTime / 300)) * 0.2;
        const resolutionScore = (resolutionRate / 100) * 0.3;
        const satisfactionScore_ = (satisfactionScore / 5) * 0.2;
        const loadScore = (1 - currentLoad) * 0.1;

        return chatScore + responseScore + resolutionScore + satisfactionScore_ + loadScore;
    }
}

export class SkillBasedStrategy implements DistributionStrategy {
    async selectAgent(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem
    ): Promise<User | null> {
        // Identifica skills necessárias baseado no conteúdo do ticket
        const requiredSkills = this.identifyRequiredSkills(queueItem);

        // Filtra agentes com skills necessárias
        const qualifiedAgents = agents.filter(agent => {
            const performance = performances.find(p => p.agentId === agent.id);
            return this.hasRequiredSkills(performance?.skills || [], requiredSkills);
        });

        if (qualifiedAgents.length === 0) return null;

        // Entre os qualificados, escolhe o menos ocupado
        return qualifiedAgents.reduce((best, current) => {
            const bestPerf = performances.find(p => p.agentId === best.id);
            const currentPerf = performances.find(p => p.agentId === current.id);

            if (!bestPerf) return current;
            if (!currentPerf) return best;

            return currentPerf.currentLoad < bestPerf.currentLoad ? current : best;
        });
    }

    private identifyRequiredSkills(queueItem: QueueItem): string[] {
        // Implementar lógica de identificação de skills necessárias
        // baseado no conteúdo da mensagem, departamento, etc.
        return [];
    }

    private hasRequiredSkills(agentSkills: string[], requiredSkills: string[]): boolean {
        return requiredSkills.every(skill => agentSkills.includes(skill));
    }
}

export class HybridStrategy implements DistributionStrategy {
    private performanceStrategy = new PerformanceBasedStrategy();
    private skillStrategy = new SkillBasedStrategy();

    async selectAgent(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem
    ): Promise<User | null> {
        // Primeiro tenta encontrar agente com skills específicas
        const skillBasedAgent = await this.skillStrategy.selectAgent(
            agents,
            performances,
            queueItem
        );

        if (skillBasedAgent) return skillBasedAgent;

        // Se não encontrar, usa estratégia baseada em performance
        return this.performanceStrategy.selectAgent(
            agents,
            performances,
            queueItem
        );
    }
}

export class RoundRobinStrategy implements DistributionStrategy {
    private lastIndex: number = -1;

    async selectAgent(
        agents: User[],
        performances: AgentPerformance[],
        queueItem: QueueItem
    ): Promise<User | null> {
        if (agents.length === 0) return null;

        this.lastIndex = (this.lastIndex + 1) % agents.length;
        return agents[this.lastIndex];
    }
}
