# Documentação Técnica - Sistema de Métricas

## Arquitetura

### Estrutura do Código
```
backend/
├── src/
│   ├── controllers/
│   │   └── metrics.controller.ts
│   ├── services/
│   │   └── business-metrics.service.ts
│   ├── modules/
│   │   └── metrics.module.ts
│   └── types/
│       └── metrics.types.ts
```

### Componentes

#### 1. MetricsModule
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([QueueItem]),
    RedisModule,
    LoggerModule
  ],
  controllers: [MetricsController],
  providers: [BusinessMetricsService],
  exports: [BusinessMetricsService]
})
export class MetricsModule {}
```

#### 2. BusinessMetricsService
Responsável pela lógica de negócio e processamento de métricas.

#### 3. MetricsController
Expõe endpoints REST para acesso às métricas.

## Implementação

### Coleta de Dados

#### 1. Tempo Real
```typescript
@Injectable()
class BusinessMetricsService {
  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    const activeChats = await this.getActiveChats();
    const waitingTickets = await this.getWaitingTickets();
    return { activeChats, waitingTickets, /* ... */ };
  }
}
```

#### 2. Histórico
```typescript
@Injectable()
class BusinessMetricsService {
  async getDailyMetrics(date: Date): Promise<DailyMetrics> {
    const metrics = await this.repository.findByDate(date);
    return this.processMetrics(metrics);
  }
}
```

### Cache

#### 1. Configuração Redis
```typescript
const CACHE_CONFIG = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  prefix: 'metrics:'
};
```

#### 2. Estratégia de Cache
```typescript
@CacheKey('dashboard-metrics')
@CacheTTL(60)
async getDashboardData(): Promise<DashboardData> {
  // Implementação
}
```

### WebSocket

#### 1. Eventos
```typescript
@WebSocketGateway()
class MetricsGateway {
  @SubscribeMessage('metrics:subscribe')
  handleSubscribe(client: Socket) {
    // Implementação
  }

  @Interval(5000)
  async broadcastMetrics() {
    const metrics = await this.metricsService.getRealtimeMetrics();
    this.server.emit('metrics:update', metrics);
  }
}
```

## Banco de Dados

### Schemas

#### 1. Métricas Históricas
```sql
CREATE TABLE metrics_history (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Configurações
```sql
CREATE TABLE metrics_config (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Índices
```sql
CREATE INDEX idx_metrics_history_date ON metrics_history(date);
CREATE INDEX idx_metrics_history_type ON metrics_history(type);
```

## Performance

### Otimizações

#### 1. Cache em Camadas
```typescript
async getMetrics(date: Date): Promise<Metrics> {
  // 1. Tentar cache L1 (memória)
  // 2. Tentar cache L2 (Redis)
  // 3. Buscar do banco
}
```

#### 2. Agregação em Background
```typescript
@Cron('0 */5 * * * *')
async aggregateMetrics() {
  // Agregar métricas em background
}
```

## Segurança

### Autenticação
```typescript
@UseGuards(AuthGuard)
@Controller('api/metrics')
export class MetricsController {
  // Implementação
}
```

### Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Throttle(100, 60)
async getMetrics() {
  // Implementação
}
```

## Testes

### Unit Tests
```typescript
describe('BusinessMetricsService', () => {
  it('should calculate daily metrics correctly', async () => {
    const result = await service.getDailyMetrics(new Date());
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Metrics API', () => {
  it('should return dashboard data', async () => {
    const response = await request(app)
      .get('/api/metrics/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });
});
```

## Monitoramento

### Logs
```typescript
@Injectable()
class BusinessMetricsService {
  private readonly logger = new Logger(BusinessMetricsService.name);

  async processMetrics() {
    this.logger.debug('Processing metrics', {
      timestamp: new Date(),
      type: 'daily'
    });
  }
}
```

### Alertas
```typescript
async checkMetricsHealth() {
  const metrics = await this.getRealtimeMetrics();
  if (metrics.waitingTime > threshold) {
    await this.alertService.notify('High waiting time detected');
  }
}
```

## Manutenção

### Backup
```bash
# Script de backup
#!/bin/bash
pg_dump -t metrics_history > metrics_backup_$(date +%Y%m%d).sql
```

### Limpeza
```sql
-- Remover dados antigos
DELETE FROM metrics_history
WHERE date < CURRENT_DATE - INTERVAL '30 days';
```

## Troubleshooting

### Problemas Comuns

#### 1. Cache Inconsistente
```bash
# Limpar cache
redis-cli FLUSHDB
```

#### 2. Performance Lenta
- Verificar índices
- Otimizar queries
- Ajustar TTL do cache

### Debug
```typescript
@Injectable()
class MetricsDebugService {
  async diagnoseIssue(type: string): Promise<DiagnosticReport> {
    // Implementação
  }
}
```
