# Script para configurar o sistema de métricas
$projectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$srcPath = Join-Path $projectRoot "src"

# Criar diretórios necessários
$dirs = @(
    "controllers",
    "modules",
    "types",
    "services"
)

foreach ($dir in $dirs) {
    $path = Join-Path $srcPath $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
    }
}

# Criar arquivo de tipos
$metricsTypesContent = @'
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
'@

Set-Content -Path (Join-Path $srcPath "types\metrics.types.ts") -Value $metricsTypesContent

# Criar controller
$controllerContent = @'
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Metrics')
@Controller('api/metrics')
@UseGuards(AuthGuard)
export class MetricsController {
    constructor(
        private readonly businessMetricsService: BusinessMetricsService
    ) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Obtém dados do dashboard' })
    @ApiResponse({ status: 200, description: 'Dados do dashboard obtidos com sucesso' })
    async getDashboardData() {
        return this.businessMetricsService.getDashboardData();
    }

    @Get('business')
    @ApiOperation({ summary: 'Obtém métricas de negócio' })
    @ApiResponse({ status: 200, description: 'Métricas obtidas com sucesso' })
    async getBusinessMetrics() {
        return this.businessMetricsService.getBusinessMetrics();
    }
}
'@

Set-Content -Path (Join-Path $srcPath "controllers\metrics.controller.ts") -Value $controllerContent

# Criar módulo
$moduleContent = @'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetricsController } from '../controllers/metrics.controller';
import { BusinessMetricsService } from '../services/business-metrics.service';
import { QueueItem } from '../entities/queue.entity';
import { RedisModule } from './redis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([QueueItem]),
        RedisModule
    ],
    controllers: [MetricsController],
    providers: [BusinessMetricsService],
    exports: [BusinessMetricsService]
})
export class MetricsModule {}
'@

Set-Content -Path (Join-Path $srcPath "modules\metrics.module.ts") -Value $moduleContent

# Atualizar variáveis de ambiente
$envContent = @'

# Métricas
METRICS_UPDATE_INTERVAL=300000  # 5 minutos em milissegundos
METRICS_RETENTION_DAYS=30       # Dias para manter histórico de métricas
'@

Add-Content -Path (Join-Path $projectRoot ".env") -Value $envContent
Add-Content -Path (Join-Path $projectRoot ".env.example") -Value $envContent

# Atualizar app.module.ts
$appModulePath = Join-Path $srcPath "app.module.ts"
$appModuleContent = Get-Content $appModulePath -Raw

if ($appModuleContent -notmatch "MetricsModule") {
    $importLine = "import { MetricsModule } from './modules/metrics.module';"
    $newContent = $appModuleContent -replace "(@Module\({[\s\S]*?imports:\s*\[)", "`$1`n    MetricsModule,"
    $newContent = "$importLine`n$newContent"
    Set-Content -Path $appModulePath -Value $newContent
}

Write-Host "Configuração do sistema de métricas concluída com sucesso!"
'@
