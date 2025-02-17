# Dashboard

## Visão Geral
O módulo de Dashboard fornece uma visão abrangente e em tempo real das operações do sistema, incluindo métricas de atendimento, status dos agentes e indicadores de performance.

## Funcionalidades

### 1. Métricas em Tempo Real
- Total de atendimentos ativos
- Tempo médio de resposta
- Taxa de resolução
- Satisfação do cliente
- Status dos agentes

### 2. Gráficos e Visualizações
```typescript
interface DashboardMetrics {
  attendanceMetrics: {
    totalTickets: number;
    openTickets: number;
    closedTickets: number;
    averageResponseTime: number;
    resolutionRate: number;
  };
  agentMetrics: {
    totalAgents: number;
    activeAgents: number;
    averageTicketsPerAgent: number;
    performanceScore: number;
  };
  clientMetrics: {
    totalClients: number;
    activeChats: number;
    satisfactionRate: number;
    returnRate: number;
  };
}
```

### 3. Filtros e Personalização
- Filtros por período
- Seleção de métricas
- Layouts personalizáveis
- Exportação de dados

## Componentes

### 1. MetricsCard
```typescript
interface MetricsCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: ReactNode;
  color?: string;
}
```

### 2. TimelineChart
```typescript
interface TimelineData {
  timestamp: Date;
  value: number;
  label: string;
}

interface TimelineChartProps {
  data: TimelineData[];
  height?: number;
  showLegend?: boolean;
  tooltipEnabled?: boolean;
}
```

### 3. AgentStatusBoard
```typescript
interface AgentStatus {
  id: string;
  name: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  currentTickets: number;
  performance: number;
}

interface AgentStatusBoardProps {
  agents: AgentStatus[];
  onStatusChange?: (agentId: string, status: string) => void;
}
```

## Socket.IO Events

### 1. Métricas
```typescript
// Emitir atualizações
socket.emit('metrics:update', {
  type: 'attendance',
  data: attendanceMetrics
});

// Receber atualizações
socket.on('metrics:updated', (data: DashboardMetrics) => {
  updateDashboard(data);
});
```

### 2. Status dos Agentes
```typescript
// Atualização de status
socket.emit('agent:status', {
  agentId: '123',
  status: 'busy'
});

// Receber atualizações
socket.on('agents:updated', (agents: AgentStatus[]) => {
  updateAgentBoard(agents);
});
```

## Integração com Backend

### 1. API Endpoints
```typescript
// Métricas gerais
GET /api/dashboard/metrics

// Métricas por período
GET /api/dashboard/metrics/:startDate/:endDate

// Métricas por agente
GET /api/dashboard/metrics/agent/:agentId

// Exportar relatórios
POST /api/dashboard/export
```

### 2. Cache
```typescript
// Configuração de cache
const metricsCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60
});

// Uso do cache
const getDashboardMetrics = async () => {
  const cached = metricsCache.get('dashboardMetrics');
  if (cached) return cached;

  const metrics = await calculateMetrics();
  metricsCache.set('dashboardMetrics', metrics);
  return metrics;
};
```

## Performance

### 1. Otimizações
- Dados em tempo real via WebSocket
- Cache de métricas não-críticas
- Lazy loading de componentes pesados
- Virtualização de listas longas

### 2. Monitoramento
```typescript
// Monitoramento de performance
const metrics = {
  dashboardLoadTime: new client.Histogram({
    name: 'dashboard_load_time_ms',
    help: 'Tempo de carregamento do dashboard em ms'
  }),
  
  metricsUpdateTime: new client.Histogram({
    name: 'metrics_update_time_ms',
    help: 'Tempo de atualização das métricas em ms'
  })
};
```

## Troubleshooting

### Problemas Comuns

1. **Dados Desatualizados**
   - Verificar conexão WebSocket
   - Validar cache
   - Checar sincronização

2. **Performance**
   - Otimizar queries
   - Ajustar intervalo de atualizações
   - Verificar memory leaks

3. **Gráficos**
   - Validar dados
   - Checar formatação
   - Verificar responsividade
