import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity } from '@nestjs/swagger';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { AuthGuard } from '../guards/auth.guard';
import { DashboardData, BusinessMetrics } from '../types/metrics.types';
import { 
    DashboardDataResponseDto, 
    BusinessMetricsResponseDto, 
    RealtimeMetricsDto 
} from '../docs/swagger/metrics.swagger';

@ApiTags('Métricas')
@ApiSecurity('bearer')
@Controller('api/metrics')
@UseGuards(AuthGuard)
export class MetricsController {
    constructor(
        private readonly businessMetricsService: BusinessMetricsService
    ) {}

    @Get('dashboard')
    @ApiOperation({ 
        summary: 'Obtém dados do dashboard', 
        description: 'Retorna uma visão geral das métricas do sistema, incluindo dados em tempo real e históricos'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Dados do dashboard obtidos com sucesso',
        type: DashboardDataResponseDto
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Acesso proibido' })
    async getDashboardData(): Promise<DashboardData> {
        return this.businessMetricsService.getDashboardData();
    }

    @Get('business')
    @ApiOperation({ 
        summary: 'Obtém métricas de negócio', 
        description: 'Retorna métricas detalhadas do negócio, incluindo dados diários, semanais e mensais'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Métricas obtidas com sucesso',
        type: BusinessMetricsResponseDto
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Acesso proibido' })
    async getBusinessMetrics(): Promise<BusinessMetrics> {
        return this.businessMetricsService.getBusinessMetrics();
    }

    @Get('realtime')
    @ApiOperation({ 
        summary: 'Obtém métricas em tempo real',
        description: 'Retorna métricas atualizadas em tempo real do sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Métricas em tempo real obtidas com sucesso',
        type: RealtimeMetricsDto
    })
    @ApiResponse({ status: 401, description: 'Não autorizado' })
    @ApiResponse({ status: 403, description: 'Acesso proibido' })
    async getRealtimeMetrics() {
        return this.businessMetricsService.getRealtimeMetrics();
    }
}
