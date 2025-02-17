export interface DashboardData {
    summary: {
        totalTicketsToday: number;
        resolvedTicketsToday: number;
        averageResponseTime: number;
        satisfactionRate: number;
    };
    realtime: {
        activeChats: number;
        waitingTickets: number;
        processingTickets: number;
        assignedTickets: number;
        averageWaitTime: number;
        agentStatus: any;
    };
    charts: {
        ticketsTrend: any;
        departmentDistribution: any;
        peakHours: any[];
    };
}

export interface BusinessMetrics {
    daily: DailyMetrics;
    weekly: WeeklyMetrics;
    monthly: MonthlyMetrics;
    realtime: RealtimeMetrics;
}

export interface DailyMetrics {
    totalTickets: number;
    resolvedTickets: number;
    averageResponseTime: number;
    averageResolutionTime: number;
    satisfactionRate: number;
    peakHours: any[];
    departmentDistribution: Record<string, number>;
}

export interface WeeklyMetrics {
    ticketsPerDay: number[];
    resolutionRatePerDay: number[];
    averageResponseTimePerDay: number[];
}

export interface MonthlyMetrics {
    ticketsPerWeek: number[];
    resolutionRatePerWeek: number[];
    averageResponseTimePerWeek: number[];
}

export interface RealtimeMetrics {
    activeChats: number;
    waitingTickets: number;
    processingTickets: number;
    assignedTickets: number;
    averageWaitTime: number;
    agentStatus: Record<string, AgentStatus>;
}

export interface AgentStatus {
    id: string;
    name: string;
    status: 'online' | 'busy' | 'away' | 'offline';
    activeChats: number;
    totalTicketsToday: number;
    averageResponseTime: number;
}
