# API Documentation - Sistema de Métricas

## Endpoints

### Dashboard
```http
GET /api/metrics/dashboard
```

#### Descrição
Retorna uma visão geral das métricas do sistema, incluindo dados em tempo real e históricos.

#### Autenticação
```
Authorization: Bearer <token>
```

#### Resposta
```json
{
  "summary": {
    "totalTicketsToday": 150,
    "resolvedTicketsToday": 120,
    "averageResponseTime": 300,
    "satisfactionRate": 95.5
  },
  "realtime": {
    "activeChats": 25,
    "waitingTickets": 10,
    "processingTickets": 15,
    "assignedTickets": 30,
    "averageWaitTime": 180,
    "agentStatus": {
      "agent1": {
        "id": "agent1",
        "name": "João Silva",
        "status": "online",
        "activeChats": 3,
        "totalTicketsToday": 25,
        "averageResponseTime": 240
      }
    }
  },
  "charts": {
    "ticketsTrend": [
      { "date": "2025-02-10", "total": 150 },
      { "date": "2025-02-09", "total": 145 }
    ],
    "departmentDistribution": {
      "Comercial": 45,
      "Suporte": 35,
      "Financeiro": 20
    },
    "peakHours": [
      { "hour": 9, "count": 25 },
      { "hour": 10, "count": 35 }
    ]
  }
}
```

### Métricas de Negócio
```http
GET /api/metrics/business
```

#### Descrição
Fornece métricas detalhadas de negócio, incluindo dados diários, semanais e mensais.

#### Autenticação
```
Authorization: Bearer <token>
```

#### Resposta
```json
{
  "daily": {
    "totalTickets": 150,
    "resolvedTickets": 120,
    "averageResponseTime": 300,
    "averageResolutionTime": 600,
    "satisfactionRate": 95.5,
    "peakHours": [
      { "hour": 9, "count": 25 },
      { "hour": 10, "count": 35 }
    ],
    "departmentDistribution": {
      "Comercial": 45,
      "Suporte": 35,
      "Financeiro": 20
    }
  },
  "weekly": {
    "ticketsPerDay": [150, 145, 160, 155, 140, 130, 120],
    "resolutionRatePerDay": [95, 93, 97, 94, 96, 92, 95],
    "averageResponseTimePerDay": [300, 280, 320, 290, 310, 285, 295]
  },
  "monthly": {
    "ticketsPerWeek": [750, 780, 800, 820],
    "resolutionRatePerWeek": [94, 95, 93, 96],
    "averageResponseTimePerWeek": [295, 305, 290, 300]
  },
  "realtime": {
    "activeChats": 25,
    "waitingTickets": 10,
    "processingTickets": 15,
    "assignedTickets": 30,
    "averageWaitTime": 180,
    "agentStatus": {
      "agent1": {
        "id": "agent1",
        "name": "João Silva",
        "status": "online",
        "activeChats": 3,
        "totalTicketsToday": 25,
        "averageResponseTime": 240
      }
    }
  }
}
```

### Métricas em Tempo Real
```http
GET /api/metrics/realtime
```

#### Descrição
Retorna métricas atualizadas em tempo real do sistema.

#### Autenticação
```
Authorization: Bearer <token>
```

#### Resposta
```json
{
  "activeChats": 25,
  "waitingTickets": 10,
  "processingTickets": 15,
  "assignedTickets": 30,
  "averageWaitTime": 180,
  "agentStatus": {
    "agent1": {
      "id": "agent1",
      "name": "João Silva",
      "status": "online",
      "activeChats": 3,
      "totalTicketsToday": 25,
      "averageResponseTime": 240
    }
  }
}
```

## WebSocket Events

### Conexão
```javascript
const socket = io('/metrics', {
  auth: {
    token: 'seu-token-jwt'
  }
});
```

### Eventos

#### metrics:update
```javascript
socket.on('metrics:update', (data) => {
  // Dados em tempo real atualizados
  console.log(data);
});
```

#### metrics:alert
```javascript
socket.on('metrics:alert', (alert) => {
  // Alertas do sistema
  console.log(alert);
});
```

## Códigos de Erro

### HTTP Status Codes

- `200` - Sucesso
- `401` - Não autorizado
- `403` - Acesso proibido
- `404` - Recurso não encontrado
- `429` - Muitas requisições
- `500` - Erro interno do servidor

### Exemplos de Erro
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

## Rate Limiting

- Limite: 100 requisições por minuto
- Headers:
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Tempo para reset do limite

## Cache

- `Cache-Control: max-age=60`
- ETags suportados
- Invalidação automática em atualizações

## Versionamento

- Versão atual: v1
- Base URL: `/api/v1/metrics`
- Versionamento via URL

## Segurança

### Autenticação
- JWT Bearer token required
- Tokens expiram em 24h
- Refresh tokens suportados

### CORS
- Origens permitidas configuráveis
- Métodos: GET, OPTIONS
- Credentials: true

## Exemplos de Uso

### cURL
```bash
curl -X GET \
  'https://api.advsac.com/api/metrics/dashboard' \
  -H 'Authorization: Bearer seu-token-jwt'
```

### JavaScript
```javascript
const response = await fetch('https://api.advsac.com/api/metrics/dashboard', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### Python
```python
import requests

response = requests.get(
    'https://api.advsac.com/api/metrics/dashboard',
    headers={'Authorization': f'Bearer {token}'}
)
data = response.json()
```
