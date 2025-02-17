import { Message } from './message.types';
import { Department } from './department.types';
import { User } from './user.types';

export interface QueueConfig {
    departmentId: string;
    maxConcurrentChats: number;
    autoCloseTimeout: number; // em minutos
    workingHours: {
        start: string; // formato HH:mm
        end: string; // formato HH:mm
        timezone: string;
        workDays: number[]; // 0-6 (domingo-sábado)
    };
    priorityRules: {
        defaultPriority: QueuePriority;
        keywords: Record<string, QueuePriority>;
        vipNumbers: string[];
    };
    distributionRules: {
        method: 'roundRobin' | 'leastBusy' | 'random';
        maxTicketsPerAgent: number;
        considerAgentPerformance: boolean;
    };
}

export enum QueuePriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface QueueItem {
    id: string;
    ticketId: string;
    departmentId: string;
    priority: QueuePriority;
    enteredAt: Date;
    lastUpdate: Date;
    status: QueueStatus;
    assignedTo?: string;
    metadata: {
        messageCount: number;
        firstMessage: Message;
        lastMessage: Message;
        source: string;
        tags: string[];
    };
}

export enum QueueStatus {
    WAITING = 'waiting',
    PROCESSING = 'processing',
    ASSIGNED = 'assigned',
    CLOSED = 'closed'
}

export interface QueueMetrics {
    totalItems: number;
    waitingItems: number;
    processingItems: number;
    assignedItems: number;
    averageWaitTime: number; // em segundos
    currentLoad: number; // porcentagem
    agentMetrics: AgentMetrics[];
}

export interface AgentMetrics {
    agentId: string;
    activeChats: number;
    averageResponseTime: number;
    resolutionRate: number;
    totalTicketsToday: number;
    status: 'online' | 'busy' | 'away' | 'offline';
}

export interface QueueEvent {
    type: 'added' | 'updated' | 'assigned' | 'closed';
    queueItem: QueueItem;
    department: Department;
    agent?: User;
    timestamp: Date;
}

export interface DistributionResult {
    success: boolean;
    queueItem: QueueItem;
    assignedTo?: User;
    error?: string;
}
