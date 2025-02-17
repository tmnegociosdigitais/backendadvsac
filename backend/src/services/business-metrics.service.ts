import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from './redis.service';
import { LoggerService } from './logger.service';
import { QueueItem, QueueStatus } from '../types/queue.types';
import { User } from '../types/user.types';

@Injectable()
export class BusinessMetricsService {
    private readonly METRICS_KEY = 'metrics:business';
    private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutos

    constructor(
        @InjectRepository(QueueItem)
        private queueRepository: Repository<QueueItem>,
        private redisService: RedisService,
        private loggerService: LoggerService
    ) {
        this.startPeriodicUpdates();
    }

    private startPeriodicUpdates(): void {
        setInterval(async () => {
            try {
                await this.updateMetrics();
            } catch (error) {
                this.loggerService.error('Erro ao atualizar métricas de negócio', error);
            }
        }, this.UPDATE_INTERVAL);
    }

    async updateMetrics(): Promise<void> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const metrics = {
            daily: await this.getDailyMetrics(today),
            weekly: await this.getWeeklyMetrics(today),
            monthly: await this.getMonthlyMetrics(today),
            realtime: await this.getRealtimeMetrics()
        };

        await this.redisService.set(this.METRICS_KEY, JSON.stringify(metrics));
    }

    private async getDailyMetrics(date: Date): Promise<any> {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const tickets = await this.queueRepository.find({
            where: {
                enteredAt: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }
        });

        return {
            totalTickets: tickets.length,
            resolvedTickets: tickets.filter(t => t.status === QueueStatus.CLOSED).length,
            averageResponseTime: this.calculateAverageResponseTime(tickets),
            averageResolutionTime: this.calculateAverageResolutionTime(tickets),
            satisfactionRate: await this.calculateSatisfactionRate(tickets),
            peakHours: this.calculatePeakHours(tickets),
            departmentDistribution: await this.calculateDepartmentDistribution(tickets)
        };
    }

    private async getWeeklyMetrics(date: Date): Promise<any> {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        // Similar ao getDailyMetrics, mas com agregação semanal
        // ...
    }

    private async getMonthlyMetrics(date: Date): Promise<any> {
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        // Similar ao getDailyMetrics, mas com agregação mensal
        // ...
    }

    private async getRealtimeMetrics(): Promise<any> {
        const activeTickets = await this.queueRepository.find({
            where: {
                status: {
                    $in: [QueueStatus.WAITING, QueueStatus.PROCESSING, QueueStatus.ASSIGNED]
                }
            }
        });

        return {
            activeChats: activeTickets.length,
            waitingTickets: activeTickets.filter(t => t.status === QueueStatus.WAITING).length,
            processingTickets: activeTickets.filter(t => t.status === QueueStatus.PROCESSING).length,
            assignedTickets: activeTickets.filter(t => t.status === QueueStatus.ASSIGNED).length,
            averageWaitTime: this.calculateAverageWaitTime(activeTickets),
            agentStatus: await this.getAgentStatus()
        };
    }

    private calculateAverageResponseTime(tickets: QueueItem[]): number {
        // Calcula o tempo médio para primeira resposta
        // ...
        return 0;
    }

    private calculateAverageResolutionTime(tickets: QueueItem[]): number {
        // Calcula o tempo médio para resolução
        // ...
        return 0;
    }

    private async calculateSatisfactionRate(tickets: QueueItem[]): Promise<number> {
        // Calcula a taxa de satisfação baseada em feedbacks
        // ...
        return 0;
    }

    private calculatePeakHours(tickets: QueueItem[]): any[] {
        // Identifica horários de pico
        // ...
        return [];
    }

    private async calculateDepartmentDistribution(tickets: QueueItem[]): Promise<any> {
        // Calcula distribuição por departamento
        // ...
        return {};
    }

    private async getAgentStatus(): Promise<any> {
        // Retorna status atual dos agentes
        // ...
        return {};
    }

    // Métodos públicos para acesso às métricas
    async getBusinessMetrics(): Promise<any> {
        const metrics = await this.redisService.get(this.METRICS_KEY);
        return metrics ? JSON.parse(metrics) : await this.updateMetrics();
    }

    async getDashboardData(): Promise<any> {
        const metrics = await this.getBusinessMetrics();
        return {
            summary: {
                totalTicketsToday: metrics.daily.totalTickets,
                resolvedTicketsToday: metrics.daily.resolvedTickets,
                averageResponseTime: metrics.daily.averageResponseTime,
                satisfactionRate: metrics.daily.satisfactionRate
            },
            realtime: metrics.realtime,
            charts: {
                ticketsTrend: metrics.weekly,
                departmentDistribution: metrics.daily.departmentDistribution,
                peakHours: metrics.daily.peakHours
            }
        };
    }
}
