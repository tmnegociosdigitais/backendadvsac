# Sistema de Métricas

## Visão Geral
O sistema de métricas fornece insights em tempo real e históricos sobre o desempenho do sistema de atendimento. Ele é projetado para fornecer dados relevantes para tomada de decisões e monitoramento da qualidade do serviço.

## Funcionalidades Principais

### 1. Dashboard em Tempo Real
- Visualização de métricas em tempo real
- Atualizações via Socket.IO
- Cache inteligente para otimização de performance

### 2. Métricas de Negócio
- Métricas diárias, semanais e mensais
- Análise de tendências
- Exportação de relatórios

### 3. Monitoramento de Performance
- Tempo médio de resposta
- Taxa de resolução
- Satisfação do cliente
- Distribuição por departamento

## Endpoints da API

### Dashboard
```typescript
GET /api/metrics/dashboard
```
Retorna uma visão geral das métricas do sistema, incluindo:
- Resumo do dia
- Dados em tempo real
- Gráficos e tendências

### Métricas de Negócio
```typescript
GET /api/metrics/business
```
Fornece métricas detalhadas de negócio:
- Métricas diárias
- Métricas semanais
- Métricas mensais
- Dados em tempo real

### Métricas em Tempo Real
```typescript
GET /api/metrics/realtime
```
Retorna métricas atualizadas em tempo real:
- Chats ativos
- Tickets em espera
- Status dos agentes
- Tempos de espera

## Configuração

### Variáveis de Ambiente
```env
# Configurações de Métricas
METRICS_UPDATE_INTERVAL=300000  # 5 minutos em milissegundos
METRICS_RETENTION_DAYS=30       # Dias para manter histórico
METRICS_REALTIME_ENABLED=true   # Habilita métricas em tempo real
METRICS_DASHBOARD_CACHE_TTL=60  # Cache do dashboard em segundos
METRICS_HISTORY_ENABLED=true    # Habilita histórico
METRICS_EXPORT_ENABLED=true     # Habilita exportação
```

## Integração com Frontend

### Socket.IO
O frontend pode se inscrever nos eventos de métricas em tempo real:
```typescript
socket.on('metrics:update', (data) => {
  // Atualizar dashboard
});
```

### Polling
Para dados não em tempo real, recomenda-se polling a cada 5 minutos:
```typescript
setInterval(fetchMetrics, 300000);
```

## Cache e Performance

### Redis
- Métricas em tempo real são armazenadas no Redis
- TTL configurável por tipo de métrica
- Invalidação automática de cache

### Otimizações
- Agregação de dados em background
- Cache em múltiplas camadas
- Compressão de dados históricos

## Segurança

### Autenticação
- Todas as rotas requerem autenticação via JWT
- Roles específicos para acesso a métricas

### Rate Limiting
- Limite de requisições por IP
- Proteção contra sobrecarga

## Manutenção

### Backup
- Backup diário de métricas históricas
- Retenção configurável de dados

### Monitoramento
- Logs detalhados de performance
- Alertas para anomalias
- Monitoramento de uso de recursos
