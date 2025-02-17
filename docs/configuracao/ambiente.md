# Configuração do Ambiente

## Variáveis de Ambiente

### Servidor
```env
# Geral
PORT=3000
NODE_ENV=development

# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/advsac
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=advsac
REDIS_TTL=3600

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRATION=24h

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

# Evolution Retry
EVOLUTION_RETRY_MAX_ATTEMPTS=3
EVOLUTION_RETRY_DELAY_MS=1000
EVOLUTION_RETRY_BACKOFF_FACTOR=2
EVOLUTION_RETRY_MAX_DELAY_MS=30000

# Evolution Monitoring
EVOLUTION_MONITORING_ENABLED=true
EVOLUTION_MONITORING_INTERVAL_MS=5000
EVOLUTION_MONITORING_MAX_HISTORY=1000

# Logs
LOG_LEVEL=info
LOG_EVOLUTION_ENABLED=true
LOG_EVOLUTION_WEBHOOK=true

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Scripts de Desenvolvimento

### Instalação
```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
```

### Desenvolvimento
```bash
# Iniciar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

### Testes
```bash
# Executar testes
npm test

# Coverage
npm run test:coverage
```

## Docker

### Desenvolvimento
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### Produção
```dockerfile
# Dockerfile.prod
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: advsac
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    command: redis-server --requirepass yourpassword
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Logs

### Winston Configuration
```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

## CI/CD

### GitHub Actions
```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Production
        run: |
          # Seus comandos de deploy aqui
```

## Monitoramento

### Health Check
```typescript
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now()
  };
  res.send(health);
});
```

### Métricas
```typescript
const metrics = {
  httpRequestDurationMs: new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['route']
  }),
  
  databaseQueryDurationMs: new client.Histogram({
    name: 'database_query_duration_ms',
    help: 'Duration of database queries in ms',
    labelNames: ['query']
  })
};
```

## Troubleshooting

### Problemas Comuns

1. **Ambiente**
   - Verificar variáveis de ambiente
   - Validar permissões
   - Checar portas em uso

2. **Dependências**
   - Limpar node_modules
   - Atualizar dependências
   - Verificar compatibilidade

3. **Performance**
   - Monitorar uso de memória
   - Verificar CPU
   - Analisar logs
