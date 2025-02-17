# Integração com Evolution API

## Configuração
A integração com a Evolution API requer as seguintes configurações no arquivo `.env`:

```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=seu_api_key_aqui
WEBHOOK_BASE_URL=https://seu-dominio.com/webhooks

# Configurações da Evolution API
EVOLUTION_SERVER_URL=https://sua-evolution-api.com
EVOLUTION_AUTHENTICATION_TYPE=apikey
EVOLUTION_AUTHENTICATION_API_KEY=sua_evolution_api_key
EVOLUTION_WEBHOOK_ENABLED=true
EVOLUTION_WEBHOOK_GLOBAL_URL=${WEBHOOK_BASE_URL}/evolution
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPSERT=true
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPDATE=true
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_DELETE=true
EVOLUTION_WEBHOOK_EVENTS_PRESENCE_UPDATE=true
EVOLUTION_WEBHOOK_EVENTS_CONNECTION_UPDATE=true
EVOLUTION_STORE_MESSAGES=true
EVOLUTION_STORE_MESSAGE_UP=true
EVOLUTION_STORE_CONTACTS=true
EVOLUTION_WEBSOCKET_ENABLED=true

# Sistema de Retry
EVOLUTION_RETRY_MAX_ATTEMPTS=3        # Número máximo de tentativas
EVOLUTION_RETRY_DELAY_MS=1000         # Delay inicial entre tentativas
EVOLUTION_RETRY_BACKOFF_FACTOR=2      # Fator de multiplicação do delay
EVOLUTION_RETRY_MAX_DELAY_MS=30000    # Tempo máximo de espera entre tentativas

# Sistema de Monitoramento
EVOLUTION_MONITORING_ENABLED=true      # Ativa/desativa monitoramento
EVOLUTION_MONITORING_INTERVAL_MS=5000  # Intervalo de verificação
EVOLUTION_MONITORING_MAX_HISTORY=1000  # Quantidade máxima de registros históricos
```

## Sistema de Retry
O sistema de retry implementa um mecanismo robusto para lidar com falhas temporárias na comunicação com a Evolution API:

### 1. Configuração
- Número máximo de tentativas configurável
- Delay inicial entre tentativas
- Backoff exponencial para evitar sobrecarga
- Tempo máximo de espera entre tentativas

### 2. Funcionalidades
- Retry automático de operações falhas
- Backoff exponencial inteligente
- Métricas detalhadas de sucesso/falha
- Eventos para monitoramento
- Logs detalhados de cada tentativa

### 3. Métricas Coletadas
- Total de operações
- Taxa de sucesso/falha
- Tempo médio até sucesso
- Número de tentativas por operação

## Sistema de Monitoramento
O monitoramento da Evolution API fornece insights em tempo real sobre a saúde e performance da integração:

### 1. Métricas de Saúde
- Status da conexão
- Tempo de resposta
- Taxa de erro
- Conexões ativas

### 2. Métricas de Performance
- Mensagens por segundo
- Tempo médio de resposta
- Uso de memória
- Uso de CPU

### 3. Histórico e Análise
- Armazenamento de métricas históricas
- Análise de tendências
- Detecção de anomalias
- Alertas configuráveis

## Eventos e Webhooks
A Evolution API suporta diversos eventos via webhook:

### 1. Eventos de Mensagem
- Novas mensagens
- Atualizações de status
- Deleções

### 2. Eventos de Conexão
- Status de conexão
- Atualizações de presença
- QR Code gerado

### 3. Configuração de Webhooks
- URLs personalizáveis
- Eventos configuráveis
- Retentativas automáticas
- Logs detalhados

## Boas Práticas

### 1. Resiliência
- Use o sistema de retry para operações importantes
- Configure timeouts apropriados
- Implemente circuit breaker quando necessário
- Monitore taxas de erro

### 2. Performance
- Utilize cache quando apropriado
- Monitore uso de recursos
- Configure limites de rate
- Otimize payloads

### 3. Monitoramento
- Configure logs detalhados
- Monitore métricas em tempo real
- Configure alertas
- Mantenha histórico para análise

## Exemplos de Código

```typescript
// Exemplo de uso do sistema de retry
const evolutionRetry = new EvolutionRetryService({
    maxAttempts: 3,
    delayMs: 1000,
    backoffFactor: 2
});

// Enviando mensagem com retry
const result = await evolutionRetry.executeWithRetry(
    async () => await sendMessage(message),
    'send'
);

// Monitorando saúde da integração
const monitor = new EvolutionMonitorService();
monitor.startMonitoring(5000); // Check a cada 5 segundos

monitor.on('healthStatusChanged', (status) => {
    logger.info('Status de saúde alterado:', status);
});
```

## Troubleshooting

### 1. Problemas Comuns
- Falhas de conexão
- Timeouts
- Erros de autenticação
- Rate limiting

### 2. Soluções
- Verifique logs detalhados
- Monitore métricas de saúde
- Ajuste configurações de retry
- Valide credenciais

### 3. Prevenção
- Mantenha monitoramento ativo
- Configure alertas preventivos
- Faça backup de mensagens importantes
- Mantenha logs organizados
