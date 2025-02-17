# Documentação Técnica - Sistema de Métricas

## Arquitetura

### Componentes Principais
```
src/
├── controllers/
│   └── metrics.controller.ts    # Endpoints da API
├── services/
│   └── business-metrics.service.ts  # Lógica de negócio
├── modules/
│   └── metrics.module.ts        # Configuração do módulo
└── types/
    └── metrics.types.ts         # Tipos e interfaces
```

### Fluxo de Dados
1. Coleta de dados em tempo real via Socket.IO
2. Processamento e agregação no BusinessMetricsService
3. Armazenamento em Redis para cache
4. Exposição via API REST e WebSocket

## Implementação

### BusinessMetricsService
```typescript
@Injectable()
export class BusinessMetricsService {
  // Coleta métricas em tempo real
  async getRealtimeMetrics(): Promise<RealtimeMetrics>;
  
  // Agrega métricas diárias
  async getDailyMetrics(): Promise<DailyMetrics>;
  
  // Processa métricas de negócio
  async getBusinessMetrics(): Promise<BusinessMetrics>;
}
```

### Cache Strategy
```typescript
// Exemplo de implementação de cache
@CacheKey('dashboard-metrics')
@CacheTTL(60)
async getDashboardData(): Promise<DashboardData> {
  // Implementação
}
```

### Websocket Events
```typescript
// Eventos emitidos
interface MetricsEvents {
  'metrics:update': (data: RealtimeMetrics) => void;
  'metrics:alert': (data: MetricsAlert) => void;
}
```

## Banco de Dados

### Tabelas
```sql
-- Métricas Históricas
CREATE TABLE metrics_history (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  data JSONB,
  timestamp TIMESTAMP
);

-- Configurações de Métricas
CREATE TABLE metrics_config (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB
);
```

### Índices
```sql
CREATE INDEX idx_metrics_timestamp ON metrics_history(timestamp);
CREATE INDEX idx_metrics_type ON metrics_history(type);
```

## Cache

### Redis Schema
```
# Chaves do Redis
metrics:realtime:{type}     # Métricas em tempo real
metrics:daily:{date}        # Métricas diárias
metrics:config:{key}        # Configurações
```

### TTL Configuration
```typescript
const CACHE_TTL = {
  realtime: 60,    // 1 minuto
  daily: 3600,     // 1 hora
  weekly: 86400    // 1 dia
};
```

## Otimizações

### Agregação de Dados
```typescript
// Exemplo de agregação
async aggregateMetrics(date: Date): Promise<void> {
  const metrics = await this.getRawMetrics(date);
  const aggregated = this.processMetrics(metrics);
  await this.saveAggregatedMetrics(aggregated);
}
```

### Background Jobs
```typescript
// Atualização periódica
@Cron('*/5 * * * *')
async updateMetrics(): Promise<void> {
  await this.aggregateMetrics(new Date());
}
```

## Monitoramento

### Logs
```typescript
// Exemplo de log
this.logger.debug('Updating metrics', {
  type: 'realtime',
  timestamp: new Date(),
  duration: performance.now() - start
});
```

### Métricas de Performance
```typescript
interface PerformanceMetrics {
  queryTime: number;
  cacheHitRate: number;
  memoryUsage: number;
}
```

## Segurança

### Rate Limiting
```typescript
// Configuração
export const rateLimitConfig = {
  ttl: 60,
  limit: 100
};
```

### Validação
```typescript
// Exemplo de validação
@ValidateMetricsAccess()
async getMetrics(@User() user: UserEntity): Promise<Metrics> {
  // Implementação
}
```

## Testes

### Unit Tests
```typescript
describe('BusinessMetricsService', () => {
  it('should aggregate daily metrics', async () => {
    // Implementação do teste
  });
});
```

### Integration Tests
```typescript
describe('Metrics API', () => {
  it('should return dashboard data', async () => {
    // Implementação do teste
  });
});
```

## Troubleshooting

### Problemas Comuns
1. Cache inconsistente
   - Solução: Limpar cache do Redis
   - Comando: `FLUSHDB`

2. Performance lenta
   - Verificar índices
   - Otimizar queries
   - Ajustar cache TTL

### Monitoramento
- Usar APM para rastrear performance
- Configurar alertas para anomalias
- Manter logs detalhados
