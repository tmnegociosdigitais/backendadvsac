/**
 * Tipos relacionados à integração com Evolution API e sistema de filas
 */

export enum MessagePriority {
    HIGH = 'high',
    NORMAL = 'normal',
    LOW = 'low'
}

export interface EvolutionConfig {
    apiUrl: string;
    apiKey: string;
    webhookUrl: string;
}

export interface Instance {
    id: string;
    name: string;
    status: 'connected' | 'disconnected' | 'connecting';
    qrcode?: string;
}

export interface Message {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
    type: string;
}

export interface QueueItem {
    message: Message;
    priority: MessagePriority;
    timestamp: Date;
}

export interface WebhookEvent {
    type: 'message' | 'status' | 'connection';
    instance: string;
    timestamp: Date;
    data: any;
}

export interface MessageStatus {
    messageId: string;
    status: 'sent' | 'delivered' | 'read';
    timestamp: Date;
}

export interface ConnectionStatus {
    instance: string;
    status: 'connected' | 'disconnected' | 'connecting';
    timestamp: Date;
}

export interface QueueConfig {
    maxConcurrentChats: number;
    autoCloseTimeout: number;
    priorityRules: {
        defaultPriority: MessagePriority;
        keywords: Record<string, MessagePriority>;
        vipNumbers: string[];
    };
    workingHours: {
        start: string;
        end: string;
        timezone: string;
        weekdays: number[];
    };
    retryConfig: {
        maxAttempts: number;
        delays: number[];
    };
}

export interface QueueMetrics {
    queueLength: number;
    activeChatsCount: number;
    priorityDistribution: Record<MessagePriority, number>;
}

// Novos tipos para suportar a atribuição de chat
export interface ChatAssignment {
    ticketId: string;
    agentId: string;
    departmentId: string;
    timestamp?: Date;
}

export interface ChatAssignmentResponse {
    ticketId: string;
    success: boolean;
    error?: string;
    timestamp: Date;
}
