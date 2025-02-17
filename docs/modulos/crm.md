# CRM Kanban

## Visão Geral
O módulo CRM implementa um sistema Kanban para gerenciamento de leads e oportunidades, com integração ao módulo de atendimentos.

## Estrutura

### 1. Tipos Base
```typescript
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  stage: KanbanStage;
  value: number;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContact?: Date;
  tags: string[];
}

interface KanbanStage {
  id: string;
  name: string;
  order: number;
  color: string;
  isDefault?: boolean;
  isClosing?: boolean;
}

interface KanbanCard {
  id: string;
  leadId: string;
  stageId: string;
  position: number;
  metadata: {
    lastActivity?: Date;
    nextAction?: string;
    probability?: number;
  };
}
```

### 2. Enums
```typescript
enum LeadSource {
  WEBSITE = 'website',
  WHATSAPP = 'whatsapp',
  REFERRAL = 'referral',
  CAMPAIGN = 'campaign'
}

enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost'
}
```

## Funcionalidades

### 1. Gerenciamento de Leads
```typescript
class LeadService {
  async create(data: CreateLeadDTO): Promise<Lead> {
    // Criar novo lead
  }

  async update(id: string, data: UpdateLeadDTO): Promise<Lead> {
    // Atualizar lead
  }

  async move(id: string, stageId: string, position: number): Promise<void> {
    // Mover lead entre estágios
  }

  async qualify(id: string, qualification: LeadQualification): Promise<Lead> {
    // Qualificar lead
  }
}
```

### 2. Kanban Board
```typescript
class KanbanService {
  async getBoard(): Promise<KanbanBoard> {
    // Retornar estrutura do board
  }

  async updateStages(stages: KanbanStage[]): Promise<void> {
    // Atualizar ordem/configuração dos estágios
  }

  async moveCard(cardId: string, stageId: string, position: number): Promise<void> {
    // Mover card no board
  }
}
```

### 3. Automações
```typescript
class AutomationService {
  async executeRules(leadId: string): Promise<void> {
    // Executar regras de automação
  }

  async scheduleFollowUp(leadId: string, date: Date): Promise<void> {
    // Agendar follow-up
  }

  async assignLeads(): Promise<void> {
    // Distribuir leads automaticamente
  }
}
```

## Socket.IO Events

### 1. Board Events
```typescript
// Atualização de card
socket.on('kanban:card:update', (card: KanbanCard) => {
  updateCard(card);
});

// Movimento de card
socket.on('kanban:card:move', (data: CardMoveEvent) => {
  moveCard(data);
});

// Novo lead
socket.on('kanban:lead:new', (lead: Lead) => {
  addLeadCard(lead);
});
```

### 2. Colaboração
```typescript
// Usuário visualizando card
socket.emit('kanban:card:view', {
  cardId: '123',
  userId: '456'
});

// Card sendo editado
socket.emit('kanban:card:editing', {
  cardId: '123',
  userId: '456'
});
```

## APIs REST

### 1. Leads
```typescript
// CRUD de leads
GET /api/leads
POST /api/leads
PUT /api/leads/:id
DELETE /api/leads/:id

// Ações específicas
POST /api/leads/:id/qualify
POST /api/leads/:id/convert
POST /api/leads/:id/assign
```

### 2. Kanban
```typescript
// Board e estágios
GET /api/kanban/board
PUT /api/kanban/stages
POST /api/kanban/stages/reorder

// Cards
POST /api/kanban/cards/move
PUT /api/kanban/cards/:id
```

## Integrações

### 1. WhatsApp
```typescript
class WhatsAppIntegration {
  async createLeadFromMessage(message: WhatsAppMessage): Promise<Lead> {
    // Criar lead a partir de mensagem
  }

  async sendFollowUp(leadId: string, template: string): Promise<void> {
    // Enviar mensagem de follow-up
  }
}
```

### 2. Email
```typescript
class EmailIntegration {
  async sendProposal(leadId: string, proposal: Proposal): Promise<void> {
    // Enviar proposta por email
  }

  async scheduleFollowUpEmail(leadId: string, date: Date): Promise<void> {
    // Agendar email de follow-up
  }
}
```

## Relatórios e Analytics

### 1. Métricas
```typescript
interface CRMMetrics {
  totalLeads: number;
  conversionRate: number;
  averageDealValue: number;
  salesCycle: number;
  stageVelocity: Record<string, number>;
}
```

### 2. Relatórios
```typescript
const generateFunnelReport = async (startDate: Date, endDate: Date) => {
  const metrics = await calculateFunnelMetrics(startDate, endDate);
  return formatFunnelReport(metrics);
};
```

## Performance

### 1. Otimizações
- Cache de board
- Lazy loading de cards
- Virtualização de listas
- Debounce em atualizações

### 2. Monitoramento
```typescript
const metrics = {
  boardLoadTime: new client.Histogram({
    name: 'crm_board_load_time_ms',
    help: 'Tempo de carregamento do board em ms'
  }),
  
  cardMoveTime: new client.Histogram({
    name: 'crm_card_move_time_ms',
    help: 'Tempo de movimentação de card em ms'
  })
};
```

## Troubleshooting

### 1. Problemas Comuns
- Sincronização de cards
- Performance do board
- Conflitos de edição
- Automações falhas

### 2. Soluções
```typescript
// Resincronizar board
const resyncBoard = async () => {
  const serverState = await fetchBoardState();
  reconcileLocalState(serverState);
};

// Resolver conflitos
const resolveConflict = async (cardId: string) => {
  const serverCard = await fetchCardState(cardId);
  const resolution = mergeStates(localCard, serverCard);
  await updateCard(resolution);
};
```
