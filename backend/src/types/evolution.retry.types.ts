/**
 * Tipos para o sistema de retry da Evolution API
 */

export interface RetryConfig {
    /** Número máximo de tentativas */
    maxAttempts: number;
    /** Delay inicial entre tentativas (ms) */
    delayMs: number;
    /** Fator de multiplicação do delay para backoff exponencial */
    backoffFactor: number;
    /** Tempo máximo de espera entre tentativas (ms) */
    maxDelayMs: number;
}

export interface RetryResult<T> {
    /** Resultado da operação */
    data?: T;
    /** Erro em caso de falha */
    error?: Error;
    /** Número de tentativas realizadas */
    attempts: number;
    /** Status final da operação */
    success: boolean;
    /** Tempo total gasto nas tentativas (ms) */
    totalTimeMs: number;
}

export interface RetryMetrics {
    /** Total de operações com retry */
    totalOperations: number;
    /** Operações com sucesso */
    successfulOperations: number;
    /** Operações com falha */
    failedOperations: number;
    /** Tempo médio até sucesso (ms) */
    averageTimeToSuccess: number;
    /** Taxa de sucesso (%) */
    successRate: number;
}

export type RetryableOperation<T> = () => Promise<T>;

export interface RetryableRequest {
    /** Identificador único da requisição */
    id: string;
    /** Tipo de operação */
    operationType: 'send' | 'receive' | 'status' | 'connection';
    /** Timestamp da primeira tentativa */
    startTime: number;
    /** Número de tentativas já realizadas */
    attempts: number;
    /** Status atual */
    status: 'pending' | 'running' | 'success' | 'failed';
}
