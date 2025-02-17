# Backend (Node.js + Express + TypeScript)

## Estrutura de Diretórios

```
/backend
├── /src
│   ├── /controllers    # Controladores da API
│   ├── /routes        # Rotas da API
│   ├── /services      # Serviços e lógica de negócio
│   ├── /middlewares   # Middlewares personalizados
│   ├── /models        # Modelos de dados
│   ├── /config        # Configurações do sistema
│   ├── /utils         # Funções utilitárias
│   └── /types         # Definições de tipos TypeScript
```

## Componentes Principais

### 1. API REST
- Endpoints RESTful
- Validação de requisições
- Tratamento de erros
- Documentação OpenAPI

### 2. Socket.IO
- Comunicação em tempo real
- Namespaces organizados
- Autenticação JWT
- Redis Adapter

### 3. Evolution API
- Integração WhatsApp
- Sistema de retry
- Monitoramento
- Webhooks

### 4. Banco de Dados
- PostgreSQL
- TypeORM
- Migrations
- Seeds

## Serviços Principais

### EvolutionRetryService
```typescript
class EvolutionRetryService {
  constructor(config: RetryConfig) {
    this.config = config;
  }

  async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    // Implementação de retry com backoff exponencial
  }
}
```

### EvolutionMonitorService
```typescript
class EvolutionMonitorService {
  constructor(options: MonitorOptions) {
    this.options = options;
  }

  startMonitoring(): void {
    // Implementação do monitoramento
  }
}
```

## Middlewares

### 1. Autenticação
```typescript
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError();
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
```

### 2. Rate Limiting
```typescript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Muitas requisições, tente novamente mais tarde'
});
```

## Configuração

### Variáveis de Ambiente
```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost:5432/advsac

# JWT
JWT_SECRET=seu_jwt_secret_aqui
JWT_EXPIRATION=24h

# Redis
REDIS_URL=redis://localhost:6379
```

## Logs e Monitoramento

### Winston Logger
```typescript
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Testes

### Jest + Supertest
```typescript
describe('AuthController', () => {
  it('should authenticate user with valid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

## Performance

### 1. Caching
```typescript
const cache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120
});
```

### 2. Query Optimization
```typescript
const users = await User.findOne({
  where: { id },
  select: ['id', 'name', 'email'],
  cache: true
});
```

## Segurança

1. **Headers**
   - Helmet middleware
   - CORS configurado
   - Rate limiting

2. **Dados**
   - Validação de input
   - Sanitização
   - Criptografia

3. **Autenticação**
   - JWT
   - Refresh tokens
   - Roles e permissões

## Desenvolvimento

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
```

## Troubleshooting

### Problemas Comuns
1. **Banco de Dados**
   - Verificar conexão
   - Validar queries
   - Checar índices

2. **Socket.IO**
   - Redis Adapter
   - Autenticação
   - Eventos perdidos

3. **Evolution API**
   - Retry system
   - Webhooks
   - Rate limits
