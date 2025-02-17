import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { LoggerService } from './logger.service';
import { 
    QueuePriority, 
    PriorityRule, 
    VIPConfig, 
    PriorityMetrics,
    PriorityCondition 
} from '../types/queue-priority';
import { QueueItem } from '../types/queue.types';
import { Message } from '../types/message.types';

@Injectable()
export class QueuePriorityService {
    private readonly RULES_KEY = 'queue:priority:rules';
    private readonly VIP_KEY = 'queue:priority:vip';
    private readonly METRICS_KEY = 'queue:priority:metrics';

    constructor(
        private redisService: RedisService,
        private logger: LoggerService
    ) {}

    async calculatePriority(message: Message, queueItem: QueueItem): Promise<QueuePriority> {
        try {
            // Verifica VIP primeiro
            const vipConfig = await this.getVIPConfig();
            if (vipConfig.numbers.includes(message.from)) {
                return vipConfig.defaultPriority;
            }

            // Obtém regras de prioridade
            const rules = await this.getPriorityRules();
            
            // Avalia cada regra em ordem
            for (const rule of rules) {
                if (await this.evaluateRule(rule, message, queueItem)) {
                    return rule.priority;
                }
            }

            // Se nenhuma regra corresponder, retorna prioridade normal
            return QueuePriority.NORMAL;
        } catch (error) {
            this.logger.error('Erro ao calcular prioridade:', error);
            return QueuePriority.NORMAL;
        }
    }

    private async evaluateRule(rule: PriorityRule, message: Message, queueItem: QueueItem): Promise<boolean> {
        for (const condition of rule.conditions) {
            const matches = await this.evaluateCondition(condition, message, queueItem);
            if (!matches) return false;
        }
        return true;
    }

    private async evaluateCondition(condition: PriorityCondition, message: Message, queueItem: QueueItem): Promise<boolean> {
        switch (condition.type) {
            case 'keyword':
                return this.evaluateKeywordCondition(condition, message);
            case 'vip':
                return this.evaluateVIPCondition(condition, message);
            case 'businessHours':
                return this.evaluateBusinessHoursCondition(condition);
            case 'messageCount':
                return this.evaluateMessageCountCondition(condition, queueItem);
            case 'waitTime':
                return this.evaluateWaitTimeCondition(condition, queueItem);
            default:
                return false;
        }
    }

    private evaluateKeywordCondition(condition: PriorityCondition, message: Message): boolean {
        const keywords = Array.isArray(condition.value) ? condition.value : [condition.value];
        const messageText = message.content.toLowerCase();
        return keywords.some(keyword => messageText.includes(keyword.toLowerCase()));
    }

    private evaluateVIPCondition(condition: PriorityCondition, message: Message): boolean {
        const vipNumbers = Array.isArray(condition.value) ? condition.value : [condition.value];
        return vipNumbers.includes(message.from);
    }

    private evaluateBusinessHoursCondition(condition: PriorityCondition): boolean {
        const now = new Date();
        const hour = now.getHours();
        const { start, end } = condition.value;
        return hour >= start && hour < end;
    }

    private evaluateMessageCountCondition(condition: PriorityCondition, queueItem: QueueItem): boolean {
        const count = queueItem.metadata.messageCount;
        const { operator, value } = condition;
        
        switch (operator) {
            case 'greaterThan':
                return count > value;
            case 'lessThan':
                return count < value;
            case 'equals':
                return count === value;
            default:
                return false;
        }
    }

    private evaluateWaitTimeCondition(condition: PriorityCondition, queueItem: QueueItem): boolean {
        const waitTime = Date.now() - queueItem.enteredAt.getTime();
        const waitTimeMinutes = Math.floor(waitTime / 60000);
        const { operator, value } = condition;
        
        switch (operator) {
            case 'greaterThan':
                return waitTimeMinutes > value;
            case 'lessThan':
                return waitTimeMinutes < value;
            case 'equals':
                return waitTimeMinutes === value;
            default:
                return false;
        }
    }

    async checkAndEscalatePriority(queueItem: QueueItem): Promise<QueuePriority> {
        const rules = await this.getPriorityRules();
        const currentRule = rules.find(r => r.priority === queueItem.priority);
        
        if (!currentRule?.sla) return queueItem.priority;

        const waitTime = Date.now() - queueItem.enteredAt.getTime();
        const waitTimeMinutes = Math.floor(waitTime / 60000);

        if (waitTimeMinutes > currentRule.sla.maxWaitTime && currentRule.sla.escalateTo) {
            await this.updatePriorityMetrics(queueItem.priority, 'slaBreached');
            return currentRule.sla.escalateTo;
        }

        return queueItem.priority;
    }

    // Métodos de configuração
    async setPriorityRules(rules: PriorityRule[]): Promise<void> {
        await this.redisService.set(this.RULES_KEY, JSON.stringify(rules));
    }

    async getPriorityRules(): Promise<PriorityRule[]> {
        const rules = await this.redisService.get(this.RULES_KEY);
        return rules ? JSON.parse(rules) : [];
    }

    async setVIPConfig(config: VIPConfig): Promise<void> {
        await this.redisService.set(this.VIP_KEY, JSON.stringify(config));
    }

    async getVIPConfig(): Promise<VIPConfig> {
        const config = await this.redisService.get(this.VIP_KEY);
        return config ? JSON.parse(config) : {
            numbers: [],
            defaultPriority: QueuePriority.HIGH
        };
    }

    // Métricas
    private async updatePriorityMetrics(priority: QueuePriority, metricType: 'total' | 'slaBreached' | 'resolved'): Promise<void> {
        const metrics = await this.getPriorityMetrics();
        const priorityMetrics = metrics.find(m => m.priority === priority);
        
        if (priorityMetrics) {
            switch (metricType) {
                case 'total':
                    priorityMetrics.totalTickets++;
                    break;
                case 'slaBreached':
                    priorityMetrics.slaBreaches++;
                    break;
                case 'resolved':
                    // Atualiza tempo médio de resolução
                    break;
            }
            
            await this.redisService.set(this.METRICS_KEY, JSON.stringify(metrics));
        }
    }

    async getPriorityMetrics(): Promise<PriorityMetrics[]> {
        const metrics = await this.redisService.get(this.METRICS_KEY);
        return metrics ? JSON.parse(metrics) : [];
    }
}
