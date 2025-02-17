export enum QueuePriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

export interface PriorityRule {
    name: string;
    priority: QueuePriority;
    conditions: PriorityCondition[];
    sla: {
        maxWaitTime: number; // minutos
        escalateTo?: QueuePriority;
    };
}

export interface PriorityCondition {
    type: 'keyword' | 'vip' | 'businessHours' | 'messageCount' | 'waitTime';
    value: any;
    operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
}

export interface VIPConfig {
    numbers: string[];
    defaultPriority: QueuePriority;
    allowedDepartments?: string[];
    customSLA?: {
        maxWaitTime: number;
        escalateTo: QueuePriority;
    };
}

export interface PriorityMetrics {
    priority: QueuePriority;
    totalTickets: number;
    averageWaitTime: number;
    slaBreaches: number;
    resolutionTime: number;
}
