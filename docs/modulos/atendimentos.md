# Módulo de Atendimentos

## Visão Geral
O módulo de atendimentos gerencia todo o fluxo de comunicação entre clientes e agentes, integrando-se com a Evolution API para mensagens WhatsApp.

## Estrutura

### 1. Tipos Principais
```typescript
interface Ticket {
  id: string;
  clientId: string;
  agentId?: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: 'whatsapp' | 'web' | 'email';
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: Message;
  tags: string[];
}

interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'client' | 'agent' | 'system';
  content: string;
  type: 'text' | 'media' | 'template';
  status: 'sent' | 'delivered' | 'read';
  timestamp: Date;
}
```

### 2. Estados do Ticket
```typescript
enum TicketStatus {
  NEW = 'new',
  WAITING = 'waiting',
  OPEN = 'open',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

## Funcionalidades

### 1. Gerenciamento de Tickets
```typescript
class TicketService {
  async create(data: CreateTicketDTO): Promise<Ticket> {
    // Criar novo ticket
  }

  async assign(ticketId: string, agentId: string): Promise<Ticket> {
    // Atribuir ticket a um agente
  }

  async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    // Atualizar status do ticket
  }

  async close(ticketId: string, resolution: string): Promise<Ticket> {
    // Fechar ticket com resolução
  }
}
```

### 2. Sistema de Filas
```typescript
class QueueService {
  async addToQueue(ticket: Ticket): Promise<void> {
    // Adicionar à fila apropriada
  }

  async assignNextTicket(agentId: string): Promise<Ticket> {
    // Atribuir próximo ticket da fila
  }

  async getPriority(ticket: Ticket): Promise<number> {
    // Calcular prioridade do ticket
  }
}
```

### 3. Integração WhatsApp
```typescript
class WhatsAppService {
  async sendMessage(ticketId: string, content: string): Promise<Message> {
    // Enviar mensagem via Evolution API
  }

  async handleWebhook(payload: WebhookPayload): Promise<void> {
    // Processar webhook da Evolution API
  }

  async syncMessages(ticketId: string): Promise<void> {
    // Sincronizar mensagens com WhatsApp
  }
}
```

## Socket.IO Events

### 1. Eventos de Ticket
```typescript
// Novo ticket
socket.on('ticket:new', (ticket: Ticket) => {
  // Atualizar interface
});

// Atualização de status
socket.on('ticket:status', (data: TicketStatusUpdate) => {
  // Atualizar status do ticket
});

// Nova mensagem
socket.on('ticket:message', (message: Message) => {
  // Adicionar mensagem ao chat
});
```

### 2. Eventos de Agente
```typescript
// Disponibilidade
socket.emit('agent:available', {
  agentId: '123',
  status: 'available'
});

// Digitando
socket.emit('agent:typing', {
  ticketId: '456',
  agentId: '123'
});
```

## APIs REST

### 1. Tickets
```typescript
// Listar tickets
GET /api/tickets
GET /api/tickets/:id

// Criar ticket
POST /api/tickets

// Atualizar ticket
PUT /api/tickets/:id

// Fechar ticket
POST /api/tickets/:id/close
```

### 2. Mensagens
```typescript
// Listar mensagens
GET /api/tickets/:id/messages

// Enviar mensagem
POST /api/tickets/:id/messages

// Marcar como lida
PUT /api/messages/:id/read
```

## Templates de Mensagem

### 1. Estrutura
```typescript
interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  language: string;
}
```

### 2. Uso
```typescript
const sendTemplate = async (ticketId: string, templateId: string, variables: any) => {
  const template = await getTemplate(templateId);
  const content = replaceVariables(template.content, variables);
  return await sendMessage(ticketId, content);
};
```

## Métricas e Relatórios

### 1. KPIs
```typescript
interface TicketMetrics {
  totalTickets: number;
  averageResponseTime: number;
  resolutionTime: number;
  satisfactionScore: number;
  reopenRate: number;
}
```

### 2. Relatórios
```typescript
const generateReport = async (startDate: Date, endDate: Date) => {
  const metrics = await calculateMetrics(startDate, endDate);
  const report = formatReport(metrics);
  return report;
};
```

## Troubleshooting

### 1. Problemas Comuns
- Mensagens não entregues
- Sincronização WhatsApp
- Atribuição incorreta
- Performance da fila

### 2. Soluções
```typescript
// Verificar status da mensagem
const checkMessageStatus = async (messageId: string) => {
  const status = await getMessageStatus(messageId);
  if (status === 'failed') {
    await retryMessage(messageId);
  }
};

// Reconectar WhatsApp
const reconnectWhatsApp = async () => {
  await whatsappService.disconnect();
  await whatsappService.connect();
};
```

## Boas Práticas

### 1. Performance
- Usar cache para templates
- Otimizar queries de mensagens
- Paginar resultados longos
- Implementar rate limiting

### 2. Segurança
- Validar permissões
- Sanitizar mensagens
- Encriptar dados sensíveis
- Logging de ações importantes
