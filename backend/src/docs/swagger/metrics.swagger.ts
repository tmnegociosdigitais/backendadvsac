import { ApiProperty } from '@nestjs/swagger';
import { DashboardData, BusinessMetrics, AgentStatus } from '../../types/metrics.types';

export class DashboardSummaryDto {
    @ApiProperty({ example: 150, description: 'Total de tickets abertos hoje' })
    totalTicketsToday: number;

    @ApiProperty({ example: 120, description: 'Total de tickets resolvidos hoje' })
    resolvedTicketsToday: number;

    @ApiProperty({ example: 300, description: 'Tempo médio de resposta em segundos' })
    averageResponseTime: number;

    @ApiProperty({ example: 95.5, description: 'Taxa de satisfação dos clientes em porcentagem' })
    satisfactionRate: number;
}

export class RealtimeMetricsDto {
    @ApiProperty({ example: 25, description: 'Número de chats ativos no momento' })
    activeChats: number;

    @ApiProperty({ example: 10, description: 'Número de tickets aguardando atendimento' })
    waitingTickets: number;

    @ApiProperty({ example: 15, description: 'Número de tickets em processamento' })
    processingTickets: number;

    @ApiProperty({ example: 30, description: 'Número de tickets atribuídos' })
    assignedTickets: number;

    @ApiProperty({ example: 180, description: 'Tempo médio de espera em segundos' })
    averageWaitTime: number;

    @ApiProperty({
        example: {
            'agent1': {
                id: 'agent1',
                name: 'João Silva',
                status: 'online',
                activeChats: 3,
                totalTicketsToday: 25,
                averageResponseTime: 240
            }
        },
        description: 'Status dos agentes ativos'
    })
    agentStatus: Record<string, AgentStatus>;
}

export class ChartsDataDto {
    @ApiProperty({
        example: [
            { date: '2025-02-10', total: 150 },
            { date: '2025-02-09', total: 145 }
        ],
        description: 'Tendência de tickets ao longo do tempo'
    })
    ticketsTrend: any;

    @ApiProperty({
        example: {
            'Comercial': 45,
            'Suporte': 35,
            'Financeiro': 20
        },
        description: 'Distribuição de tickets por departamento'
    })
    departmentDistribution: any;

    @ApiProperty({
        example: [
            { hour: 9, count: 25 },
            { hour: 10, count: 35 }
        ],
        description: 'Horários de pico de atendimento'
    })
    peakHours: any[];
}

export class DashboardDataResponseDto implements DashboardData {
    @ApiProperty({ type: DashboardSummaryDto })
    summary: DashboardSummaryDto;

    @ApiProperty({ type: RealtimeMetricsDto })
    realtime: RealtimeMetricsDto;

    @ApiProperty({ type: ChartsDataDto })
    charts: ChartsDataDto;
}

export class DailyMetricsDto {
    @ApiProperty({ example: 150, description: 'Total de tickets no dia' })
    totalTickets: number;

    @ApiProperty({ example: 120, description: 'Total de tickets resolvidos' })
    resolvedTickets: number;

    @ApiProperty({ example: 300, description: 'Tempo médio de resposta em segundos' })
    averageResponseTime: number;

    @ApiProperty({ example: 600, description: 'Tempo médio de resolução em segundos' })
    averageResolutionTime: number;

    @ApiProperty({ example: 95.5, description: 'Taxa de satisfação em porcentagem' })
    satisfactionRate: number;

    @ApiProperty({
        example: [
            { hour: 9, count: 25 },
            { hour: 10, count: 35 }
        ],
        description: 'Horários de pico'
    })
    peakHours: any[];

    @ApiProperty({
        example: {
            'Comercial': 45,
            'Suporte': 35,
            'Financeiro': 20
        },
        description: 'Distribuição por departamento'
    })
    departmentDistribution: Record<string, number>;
}

export class WeeklyMetricsDto {
    @ApiProperty({
        example: [150, 145, 160, 155, 140, 130, 120],
        description: 'Tickets por dia da semana'
    })
    ticketsPerDay: number[];

    @ApiProperty({
        example: [95, 93, 97, 94, 96, 92, 95],
        description: 'Taxa de resolução por dia em porcentagem'
    })
    resolutionRatePerDay: number[];

    @ApiProperty({
        example: [300, 280, 320, 290, 310, 285, 295],
        description: 'Tempo médio de resposta por dia em segundos'
    })
    averageResponseTimePerDay: number[];
}

export class MonthlyMetricsDto {
    @ApiProperty({
        example: [750, 780, 800, 820],
        description: 'Tickets por semana'
    })
    ticketsPerWeek: number[];

    @ApiProperty({
        example: [94, 95, 93, 96],
        description: 'Taxa de resolução por semana em porcentagem'
    })
    resolutionRatePerWeek: number[];

    @ApiProperty({
        example: [295, 305, 290, 300],
        description: 'Tempo médio de resposta por semana em segundos'
    })
    averageResponseTimePerWeek: number[];
}

export class BusinessMetricsResponseDto implements BusinessMetrics {
    @ApiProperty({ type: DailyMetricsDto })
    daily: DailyMetricsDto;

    @ApiProperty({ type: WeeklyMetricsDto })
    weekly: WeeklyMetricsDto;

    @ApiProperty({ type: MonthlyMetricsDto })
    monthly: MonthlyMetricsDto;

    @ApiProperty({ type: RealtimeMetricsDto })
    realtime: RealtimeMetricsDto;
}
