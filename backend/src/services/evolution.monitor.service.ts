/**
 * Serviço de monitoramento para Evolution API
 * Monitora métricas, saúde e performance da integração
 */

import { EventEmitter } from 'events';
import { RetryMetrics } from '../types/evolution.retry.types';
import { logger } from '../utils/logger';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: number;
    details: {
        connectionStatus: boolean;
        responseTime: number;
        errorRate: number;
        activeConnections: number;
    };
}

interface PerformanceMetrics {
    messagesPerSecond: number;
    averageResponseTime: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    timestamp: number;
}

export class EvolutionMonitorService extends EventEmitter {
    private healthStatus: HealthStatus;
    private performanceMetrics: PerformanceMetrics[];
    private readonly maxMetricsHistory: number;
    private checkInterval: NodeJS.Timeout | null;

    constructor(maxMetricsHistory: number = 1000) {
        super();
        this.maxMetricsHistory = maxMetricsHistory;
        this.performanceMetrics = [];
        this.healthStatus = {
            status: 'healthy',
            lastCheck: Date.now(),
            details: {
                connectionStatus: true,
                responseTime: 0,
                errorRate: 0,
                activeConnections: 0
            }
        };
        this.checkInterval = null;
    }

    /**
     * Inicia monitoramento
     * @param intervalMs Intervalo entre verificações em ms
     */
    startMonitoring(intervalMs: number = 5000): void {
        if (this.checkInterval) {
            this.stopMonitoring();
        }

        this.checkInterval = setInterval(() => this.checkHealth(), intervalMs);
        logger.info('Monitoramento Evolution API iniciado');
    }

    /**
     * Para monitoramento
     */
    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            logger.info('Monitoramento Evolution API parado');
        }
    }

    /**
     * Verifica saúde da integração
     */
    private async checkHealth(): Promise<void> {
        try {
            // Coletar métricas de performance
            const metrics = await this.collectPerformanceMetrics();
            this.addPerformanceMetrics(metrics);

            // Avaliar status de saúde
            const previousStatus = this.healthStatus.status;
            this.healthStatus = {
                status: this.evaluateHealthStatus(metrics),
                lastCheck: Date.now(),
                details: {
                    connectionStatus: metrics.activeConnections > 0,
                    responseTime: metrics.averageResponseTime,
                    errorRate: this.calculateErrorRate(),
                    activeConnections: metrics.activeConnections
                }
            };

            // Emitir evento se status mudou
            if (previousStatus !== this.healthStatus.status) {
                this.emit('healthStatusChanged', {
                    previousStatus,
                    currentStatus: this.healthStatus.status,
                    timestamp: Date.now(),
                    details: this.healthStatus.details
                });
            }

            // Emitir métricas atualizadas
            this.emit('metricsUpdated', metrics);

        } catch (error) {
            logger.error('Erro ao verificar saúde da Evolution API:', error);
            this.emit('monitoringError', error);
        }
    }

    /**
     * Coleta métricas de performance
     */
    private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
        // TODO: Implementar coleta real de métricas da Evolution API
        return {
            messagesPerSecond: Math.random() * 10,
            averageResponseTime: Math.random() * 200,
            activeConnections: Math.floor(Math.random() * 5),
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: process.cpuUsage().user,
            timestamp: Date.now()
        };
    }

    /**
     * Adiciona métricas ao histórico
     */
    private addPerformanceMetrics(metrics: PerformanceMetrics): void {
        this.performanceMetrics.push(metrics);
        
        // Manter tamanho máximo do histórico
        if (this.performanceMetrics.length > this.maxMetricsHistory) {
            this.performanceMetrics.shift();
        }
    }

    /**
     * Avalia status de saúde com base nas métricas
     */
    private evaluateHealthStatus(metrics: PerformanceMetrics): HealthStatus['status'] {
        if (
            metrics.activeConnections === 0 ||
            metrics.averageResponseTime > 1000 ||
            this.calculateErrorRate() > 50
        ) {
            return 'unhealthy';
        }

        if (
            metrics.averageResponseTime > 500 ||
            this.calculateErrorRate() > 20
        ) {
            return 'degraded';
        }

        return 'healthy';
    }

    /**
     * Calcula taxa de erro atual
     */
    private calculateErrorRate(): number {
        // TODO: Implementar cálculo real baseado em métricas da Evolution API
        return Math.random() * 100;
    }

    /**
     * Retorna status atual de saúde
     */
    getHealthStatus(): HealthStatus {
        return { ...this.healthStatus };
    }

    /**
     * Retorna métricas de performance
     * @param minutes Número de minutos de histórico
     */
    getPerformanceMetrics(minutes: number = 5): PerformanceMetrics[] {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.performanceMetrics.filter(m => m.timestamp >= cutoff);
    }

    /**
     * Atualiza métricas com dados do serviço de retry
     */
    updateRetryMetrics(retryMetrics: RetryMetrics): void {
        this.emit('retryMetricsUpdated', retryMetrics);
        
        // Usar métricas de retry para ajustar status de saúde
        if (retryMetrics.successRate < 50) {
            this.healthStatus.status = 'unhealthy';
        } else if (retryMetrics.successRate < 80) {
            this.healthStatus.status = 'degraded';
        }
    }
}
