/**
 * Serviço de retry para Evolution API
 * Implementa lógica de retentativas com backoff exponencial
 */

import { EventEmitter } from 'events';
import { 
    RetryConfig, 
    RetryResult, 
    RetryMetrics, 
    RetryableOperation,
    RetryableRequest 
} from '../types/evolution.retry.types';
import { logger } from '../utils/logger';

export class EvolutionRetryService extends EventEmitter {
    private config: RetryConfig;
    private metrics: RetryMetrics;
    private activeRequests: Map<string, RetryableRequest>;

    constructor(config?: Partial<RetryConfig>) {
        super();
        this.config = {
            maxAttempts: config?.maxAttempts ?? 3,
            delayMs: config?.delayMs ?? 1000,
            backoffFactor: config?.backoffFactor ?? 2,
            maxDelayMs: config?.maxDelayMs ?? 30000
        };

        this.metrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageTimeToSuccess: 0,
            successRate: 0
        };

        this.activeRequests = new Map();
    }

    /**
     * Executa uma operação com retry
     * @param operation Operação a ser executada
     * @param operationType Tipo da operação
     * @returns Resultado da operação
     */
    async executeWithRetry<T>(
        operation: RetryableOperation<T>,
        operationType: RetryableRequest['operationType']
    ): Promise<RetryResult<T>> {
        const startTime = Date.now();
        const requestId = `${operationType}_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
        let attempts = 0;
        let lastError: Error | undefined;

        // Registrar nova requisição
        this.activeRequests.set(requestId, {
            id: requestId,
            operationType,
            startTime,
            attempts: 0,
            status: 'pending'
        });

        while (attempts < this.config.maxAttempts) {
            try {
                // Atualizar status da requisição
                this.activeRequests.get(requestId)!.status = 'running';
                this.activeRequests.get(requestId)!.attempts = ++attempts;

                // Executar operação
                const result = await operation();

                // Atualizar métricas de sucesso
                this.updateMetrics(true, Date.now() - startTime);
                
                // Atualizar status da requisição
                this.activeRequests.get(requestId)!.status = 'success';
                
                // Emitir evento de sucesso
                this.emit('success', {
                    requestId,
                    operationType,
                    attempts,
                    duration: Date.now() - startTime
                });

                // Limpar requisição ativa
                this.activeRequests.delete(requestId);

                return {
                    data: result,
                    attempts,
                    success: true,
                    totalTimeMs: Date.now() - startTime
                };
            } catch (error) {
                lastError = error as Error;
                logger.error(`Tentativa ${attempts} falhou para ${operationType}:`, error);

                // Se atingiu número máximo de tentativas
                if (attempts === this.config.maxAttempts) {
                    // Atualizar métricas de falha
                    this.updateMetrics(false, Date.now() - startTime);
                    
                    // Atualizar status da requisição
                    this.activeRequests.get(requestId)!.status = 'failed';
                    
                    // Emitir evento de falha
                    this.emit('failure', {
                        requestId,
                        operationType,
                        attempts,
                        error: lastError,
                        duration: Date.now() - startTime
                    });

                    // Limpar requisição ativa
                    this.activeRequests.delete(requestId);
                    
                    break;
                }

                // Calcular próximo delay com backoff exponencial
                const delay = Math.min(
                    this.config.delayMs * Math.pow(this.config.backoffFactor, attempts - 1),
                    this.config.maxDelayMs
                );

                // Emitir evento de retry
                this.emit('retry', {
                    requestId,
                    operationType,
                    attempts,
                    nextDelay: delay,
                    error: lastError
                });

                // Aguardar antes da próxima tentativa
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return {
            error: lastError,
            attempts,
            success: false,
            totalTimeMs: Date.now() - startTime
        };
    }

    /**
     * Atualiza métricas do serviço
     */
    private updateMetrics(success: boolean, duration: number): void {
        this.metrics.totalOperations++;
        
        if (success) {
            this.metrics.successfulOperations++;
            // Atualizar média de tempo até sucesso
            this.metrics.averageTimeToSuccess = (
                (this.metrics.averageTimeToSuccess * (this.metrics.successfulOperations - 1) + duration) /
                this.metrics.successfulOperations
            );
        } else {
            this.metrics.failedOperations++;
        }

        this.metrics.successRate = (
            (this.metrics.successfulOperations / this.metrics.totalOperations) * 100
        );
    }

    /**
     * Retorna métricas atuais do serviço
     */
    getMetrics(): RetryMetrics {
        return { ...this.metrics };
    }

    /**
     * Retorna lista de requisições ativas
     */
    getActiveRequests(): RetryableRequest[] {
        return Array.from(this.activeRequests.values());
    }

    /**
     * Reseta métricas do serviço
     */
    resetMetrics(): void {
        this.metrics = {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            averageTimeToSuccess: 0,
            successRate: 0
        };
    }
}
