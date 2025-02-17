# Sistema de Webhooks

## Visão Geral
O sistema de webhooks permite a integração em tempo real com serviços externos, principalmente com a Evolution API para mensagens WhatsApp.

## Configuração

### 1. Variáveis de Ambiente
```env
# Webhooks
WEBHOOK_BASE_URL=https://seu-dominio.com/webhooks
WEBHOOK_SECRET=seu_webhook_secret

# Evolution API Webhooks
EVOLUTION_WEBHOOK_ENABLED=true
EVOLUTION_WEBHOOK_GLOBAL_URL=${WEBHOOK_BASE_URL}/evolution
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPSERT=true
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPDATE=true
EVOLUTION_WEBHOOK_EVENTS_MESSAGES_DELETE=true
EVOLUTION_WEBHOOK_EVENTS_PRESENCE_UPDATE=true
EVOLUTION_WEBHOOK_EVENTS_CONNECTION_UPDATE=true
```

### 2. Configuração do Express
```typescript
app.use('/webhooks', webhookRouter);
app.use(express.json({ verify: webhookVerification }));
```

## Endpoints

### 1. Evolution API
```typescript
// Webhook principal
POST /webhooks/evolution

// Eventos específicos
POST /webhooks/evolution/messages
POST /webhooks/evolution/status
POST /webhooks/evolution/presence
```

### 2. Outros Serviços
```typescript
// Webhooks genéricos
POST /webhooks/custom/:integration
```

## Segurança

### 1. Verificação de Assinatura
```typescript
const webhookVerification = (req: Request, res: Response, buf: Buffer) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = buf.toString();
  
  if (!verifySignature(signature, payload)) {
    throw new Error('Invalid webhook signature');
  }
};
```

### 2. Rate Limiting
```typescript
const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many webhook requests'
});
```

## Handlers

### 1. Evolution API
```typescript
class EvolutionWebhookHandler {
  async handleMessage(payload: WebhookPayload): Promise<void> {
    const { message, type } = payload;
    
    switch (type) {
      case 'message.upsert':
        await this.handleNewMessage(message);
        break;
      case 'message.update':
        await this.handleMessageUpdate(message);
        break;
      case 'message.delete':
        await this.handleMessageDelete(message);
        break;
    }
  }

  async handleStatus(payload: WebhookPayload): Promise<void> {
    const { status, timestamp } = payload;
    await this.updateConnectionStatus(status, timestamp);
  }

  async handlePresence(payload: WebhookPayload): Promise<void> {
    const { presence, user } = payload;
    await this.updateUserPresence(user, presence);
  }
}
```

### 2. Retry System
```typescript
class WebhookRetryService {
  async executeWithRetry(
    handler: () => Promise<void>,
    maxAttempts: number = 3
  ): Promise<void> {
    let attempt = 1;
    
    while (attempt <= maxAttempts) {
      try {
        await handler();
        return;
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await this.delay(attempt * 1000);
        attempt++;
      }
    }
  }
}
```

## Eventos

### 1. Evolution API
```typescript
interface WebhookEvents {
  // Mensagens
  'message.upsert': MessageUpsertEvent;
  'message.update': MessageUpdateEvent;
  'message.delete': MessageDeleteEvent;
  
  // Status
  'connection.update': ConnectionUpdateEvent;
  'presence.update': PresenceUpdateEvent;
}
```

### 2. Processamento
```typescript
class WebhookEventProcessor {
  async process(event: WebhookEvent): Promise<void> {
    // Validar evento
    this.validateEvent(event);
    
    // Processar com retry
    await this.retryService.executeWithRetry(
      async () => await this.processEvent(event)
    );
    
    // Registrar processamento
    await this.logEventProcessing(event);
  }
}
```

## Monitoramento

### 1. Métricas
```typescript
const webhookMetrics = {
  receivedEvents: new client.Counter({
    name: 'webhook_events_received_total',
    help: 'Total de eventos webhook recebidos'
  }),
  
  processingTime: new client.Histogram({
    name: 'webhook_processing_time_ms',
    help: 'Tempo de processamento de webhook em ms'
  }),
  
  failedEvents: new client.Counter({
    name: 'webhook_events_failed_total',
    help: 'Total de eventos webhook falhos'
  })
};
```

### 2. Logs
```typescript
const logWebhookEvent = async (event: WebhookEvent) => {
  logger.info('Webhook event received', {
    type: event.type,
    timestamp: event.timestamp,
    success: event.success,
    processingTime: event.processingTime
  });
};
```

## Troubleshooting

### 1. Problemas Comuns
- Falhas de entrega
- Assinatura inválida
- Timeout no processamento
- Duplicação de eventos

### 2. Soluções
```typescript
// Verificar status do webhook
const checkWebhookHealth = async () => {
  const status = await getWebhookStatus();
  if (!status.healthy) {
    await reconfigureWebhook();
  }
};

// Reprocessar eventos falhos
const reprocessFailedEvents = async () => {
  const failedEvents = await getFailedEvents();
  for (const event of failedEvents) {
    await processEvent(event);
  }
};
```

## Boas Práticas

### 1. Performance
- Processamento assíncrono
- Timeout adequado
- Queue para eventos
- Cache de resultados

### 2. Segurança
- Validar assinaturas
- Limitar taxa de requests
- Sanitizar payloads
- Logging seguro
