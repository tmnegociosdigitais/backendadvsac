# ADVSac - Documentação do Sistema

## Visão Geral
O ADVSac é uma plataforma integrada para escritórios de advocacia que oferece funcionalidades de atendimento via WhatsApp utilizando a Evolution API.

## Estrutura do Projeto

### Frontend (Next.js + TypeScript)
- `/frontend`
  - `/src`
    - `/components` - Componentes React reutilizáveis
    - `/pages` - Rotas e páginas da aplicação
    - `/styles` - Estilos globais e temas
    - `/hooks` - Hooks personalizados
    - `/services` - Serviços de API e integrações
    - `/utils` - Funções utilitárias
    - `/contexts` - Contextos React
    - `/types` - Definições de tipos TypeScript

### Backend (Node.js + Express + TypeScript)
- `/backend`
  - `/src`
    - `/controllers` - Controladores da API
    - `/routes` - Rotas da API
    - `/services` - Serviços e lógica de negócio
    - `/middlewares` - Middlewares personalizados
    - `/models` - Modelos de dados
    - `/config` - Configurações do sistema
    - `/utils` - Funções utilitárias
    - `/types` - Definições de tipos TypeScript

## Módulos do Sistema

### 1. Dashboard
- Métricas em tempo real
- Gráficos e estatísticas
- Visão geral do sistema

### 2. Novidades
- Sistema de changelogs
- Atualizações do sistema
- Notificações importantes

### 3. Atendimentos
- Gestão de tickets
- Fila de atendimento
- Integração com WhatsApp

### 4. CRM Kanban
- Gestão visual de leads
- Pipeline de atendimento
- Status de conversas

### 5. Chatbot
- Construtor visual de fluxos
- Nós configuráveis
- Automação de mensagens

### 6. Gerenciamento de Usuários
- Hierarquia de acesso
- Níveis: Dono, Contratante, Funcionário
- Gestão de permissões

## Sistema de Autenticação e Autorização

### Visão Geral
O sistema implementa um mecanismo robusto de autenticação e autorização baseado em JWT (JSON Web Tokens) com suporte a hierarquia de papéis.

### Hierarquia de Papéis
1. ROLE_OWNER (Proprietário)
   - Acesso total ao sistema
   - Pode criar outros proprietários
   - Gerencia funções de usuários
   - Acesso a todas as configurações

2. ROLE_CONTRACTOR (Contratante)
   - Gerenciamento de equipe
   - Visualização de relatórios
   - Acesso a configurações específicas
   - Não pode criar proprietários

3. ROLE_EMPLOYEE (Funcionário)
   - Acesso básico ao sistema
   - Funções operacionais
   - Acesso apenas aos próprios recursos

### Endpoints da API

#### Autenticação
```
POST /auth/login
- Autentica usuário com email e senha
- Retorna token JWT e dados do usuário

POST /auth/refresh-token
- Atualiza token JWT expirado
- Requer autenticação
```

#### Gestão de Usuários
```
POST /auth/register
- Cria novo usuário
- Requer ROLE_OWNER
- Validação especial para criação de ROLE_OWNER

GET /auth/users
- Lista todos os usuários
- Requer ROLE_CONTRACTOR ou superior

GET /auth/users/:userId
- Obtém detalhes de um usuário
- Requer ser o próprio usuário ou superior

PUT /auth/users/:userId
- Atualiza dados do usuário
- Requer ser o próprio usuário ou ROLE_OWNER
- Apenas ROLE_OWNER pode alterar funções

DELETE /auth/users/:userId
- Desativa um usuário
- Requer ROLE_OWNER
```

### Middlewares de Segurança

1. authenticate
   - Valida token JWT
   - Adiciona dados do usuário à requisição
   - Logging de tentativas de acesso

2. authorize
   - Verifica hierarquia de papéis
   - Controle granular de permissões
   - Logging de tentativas não autorizadas

3. authorizeResource
   - Controle de acesso a recursos específicos
   - Validação de propriedade do recurso
   - Suporte a exceções por papel

### Segurança e Boas Práticas

1. Tokens JWT
   - Tempo de expiração configurável
   - Payload mínimo por segurança
   - Refresh token para melhor UX

2. Senhas
   - Armazenamento com hash bcrypt
   - Validações de força
   - Tentativas de login monitoradas

3. Logging
   - Registro detalhado de ações
   - Monitoramento de tentativas suspeitas
   - Auditoria de alterações

4. Validações
   - Dados de entrada sanitizados
   - Verificações de unicidade
   - Validações de regras de negócio

## Configuração do Banco de Dados

### PostgreSQL
O sistema utiliza PostgreSQL como banco de dados principal. As configurações padrão são:

- Host: localhost
- Porta: 5432
- Banco de dados: advsac_dev (desenvolvimento)
- Usuário: postgres
- Senha: postgres

### Configurações do TypeORM
O arquivo `src/config/database.config.ts` centraliza as configurações do TypeORM:

1. Ambientes
   - Desenvolvimento:
     - Sincronização automática ativada
     - Logging detalhado
     - Pool de conexões: 10 conexões
     - SSL desativado
   
   - Produção:
     - Sincronização automática desativada
     - Logging mínimo
     - Pool de conexões: 20 conexões
     - SSL ativado

### Sistema de Cache (Redis)
O Redis é utilizado como sistema de cache com as seguintes configurações:

1. Requisitos do Redis:
   - Redis Server 7.0 ou superior
   - Porta padrão: 6379
   - Autenticação obrigatória
   - Memória máxima: 2GB
   - Política de memória: allkeys-lru
   - Persistência: AOF habilitado
   - Backup automático diário

2. Configurações de Cache:
   - Duração padrão: 1 minuto
   - Estratégia de retry:
     - Máximo de 3 tentativas
     - Intervalo crescente entre tentativas
     - Desiste após 3 falhas

3. Políticas de TTL:
   - Mensagens: 24 horas
   - Status de cliente: 30 minutos
   - Configurações: 1 hora
   - Limite de 100 itens por cliente

4. Variáveis de Ambiente:
   - REDIS_HOST: Endereço do servidor Redis
   - REDIS_PORT: Porta do servidor (padrão: 6379)
   - REDIS_PASSWORD: Senha de autenticação

### Arquivos de Configuração
1. `.env.development`
   - Contém as variáveis de ambiente para desenvolvimento
   - Configurações do banco de dados e outras chaves

2. `ormconfig.json`
   - Configuração do TypeORM
   - Mapeamento de entidades e migrações
   - Configurações de conexão com o banco

### Migrações
As migrações do banco de dados são gerenciadas pelo TypeORM e estão localizadas em:
- `/src/migrations`

Para executar as migrações:
```bash
npm run typeorm migration:run
```

Para criar uma nova migração:
```bash
npm run typeorm migration:create -n NomeDaMigracao
```

## Banco de Dados

### Configuração
O sistema utiliza PostgreSQL com TypeORM para persistência de dados:

1. Estrutura
   - Entidades em `src/entities`
   - Migrações em `src/migrations`
   - Repositórios em `src/repositories`

2. Tabelas Principais
   - users: Armazena informações dos usuários
     - id (UUID): Identificador único
     - name (VARCHAR): Nome do usuário
     - email (VARCHAR): Email único
     - password (VARCHAR): Senha hasheada
     - role (ENUM): Função do usuário
     - active (BOOLEAN): Status do usuário
     - created_at (TIMESTAMP): Data de criação
     - updated_at (TIMESTAMP): Data de atualização

3. Migrações
   - Sistema de migrações para controle de versão do banco
   - Scripts disponíveis:
     ```bash
     # Gerar nova migração
     npm run migration:generate -- src/migrations/NomeDaMigracao

     # Executar migrações pendentes
     npm run migration:run

     # Reverter última migração
     npm run migration:revert
     ```

4. Configuração do TypeORM
   - Arquivo de configuração: `ormconfig.json`
   - Configurações de ambiente em `src/config/database.ts`
   - Inicialização automática no `app.ts`

5. Segurança
   - Senhas armazenadas com hash bcrypt
   - Índices otimizados para consultas frequentes
   - Validações em nível de banco de dados

### Uso no Código

#### Entidades
```typescript
// Exemplo de uso da entidade User
import { User } from '../entities/user.entity';

// Criar novo usuário
const user = new User();
user.name = 'Nome';
user.email = 'email@exemplo.com';
```

#### Repositórios
```typescript
// Exemplo de uso do repositório de usuários
import userRepository from '../repositories/user.repository';

// Buscar usuário por email
const user = await userRepository.findByEmail('email@exemplo.com');

// Atualizar usuário
await userRepository.update(userId, { name: 'Novo Nome' });
```

### Configuração Inicial

1. Criar banco de dados:
```sql
CREATE DATABASE advsac;
```

2. Configurar variáveis de ambiente:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=advsac
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
```

3. Executar migrações:
```bash
npm run migration:run
```

## Integração com Evolution API

### Endpoints Implementados

#### Instâncias
```
GET /instances/:instanceName
- Obtém informações da instância
- Requer autenticação
- Retorna status e detalhes da conexão

POST /instances
- Cria nova instância
- Requer ROLE_OWNER
- Configurações personalizáveis

POST /instances/:instanceName/connect
- Conecta uma instância
- Requer ROLE_CONTRACTOR ou superior
- Retorna QR Code quando necessário

POST /instances/:instanceName/disconnect
- Desconecta uma instância
- Requer ROLE_CONTRACTOR ou superior
- Logging de desconexão
```

#### Mensagens
```
POST /instances/:instanceName/messages
- Envia mensagens (texto ou template)
- Suporta múltiplos tipos de mídia
- Sistema de retry automático
- Validação de templates

GET /instances/:instanceName/messages
- Lista mensagens da instância
- Filtros por data e status
- Paginação e ordenação
```

#### Grupos
```
POST /instances/:instanceName/groups
- Cria novos grupos
- Adiciona participantes
- Configurações do grupo

GET /instances/:instanceName/groups/:groupId
- Obtém informações do grupo
- Lista de participantes
- Estatísticas do grupo
```

#### Webhooks
```
POST /instances/:instanceName/webhook
- Atualiza configurações de webhook
- URLs personalizáveis
- Eventos configuráveis
```

### Recursos Implementados

1. Gerenciamento de Instâncias
   - Criação e conexão automática
   - Monitoramento de status
   - Reconexão automática
   - Backup de sessões

2. Sistema de Mensagens
   - Envio em massa
   - Templates personalizados
   - Mídia suportada:
     - Imagens
     - Documentos
     - Áudio
     - Vídeo
     - Localização

3. Gestão de Grupos
   - Criação automatizada
   - Gestão de participantes
   - Mensagens em massa
   - Moderação automática

4. Webhooks
   - Eventos em tempo real
   - Retry em falhas
   - Validação de payload
   - Logs detalhados

### Segurança e Performance

1. Rate Limiting
   - Limites por instância
   - Proteção contra spam
   - Fila de mensagens

2. Monitoramento
   - Status das conexões
   - Uso de recursos
   - Latência de mensagens
   - Logs de eventos

3. Backup e Recuperação
   - Backup automático de sessões
   - Restore automático
   - Persistência de dados

4. Cache
   - Redis para performance
   - Cache de templates
   - Cache de status
   - TTL configurável
   
## Integração com Evolution API

### Visão Geral
A integração com a Evolution API é um componente crítico do sistema, responsável por toda a comunicação com o WhatsApp. Esta seção detalha as configurações e funcionalidades disponíveis.

### Variáveis de Ambiente

#### Configurações Básicas
- `EVOLUTION_API_URL`: URL base da Evolution API (ex: http://localhost:8080)
- `EVOLUTION_API_KEY`: Chave de API para autenticação
- `WEBHOOK_BASE_URL`: URL base para webhooks (ex: https://seu-dominio.com/webhooks)

#### Autenticação
- `EVOLUTION_AUTHENTICATION_TYPE`: Tipo de autenticação ('apikey' ou 'jwt')
- `EVOLUTION_AUTHENTICATION_API_KEY`: Chave de API para autenticação

#### Webhooks
- `EVOLUTION_WEBHOOK_ENABLED`: Habilita/desabilita webhooks (true/false)
- `EVOLUTION_WEBHOOK_GLOBAL_URL`: URL global para webhooks
- `EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPSERT`: Notificações de novas mensagens
- `EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPDATE`: Notificações de atualização de mensagens
- `EVOLUTION_WEBHOOK_EVENTS_MESSAGES_DELETE`: Notificações de exclusão de mensagens
- `EVOLUTION_WEBHOOK_EVENTS_PRESENCE_UPDATE`: Notificações de presença
- `EVOLUTION_WEBHOOK_EVENTS_CONNECTION_UPDATE`: Notificações de conexão

#### Armazenamento
- `EVOLUTION_STORE_MESSAGES`: Armazena mensagens
- `EVOLUTION_STORE_MESSAGE_UP`: Armazena atualizações de mensagens
- `EVOLUTION_STORE_CONTACTS`: Armazena contatos

#### WebSocket
- `EVOLUTION_WEBSOCKET_ENABLED`: Habilita/desabilita WebSocket

#### Logs
- `LOG_EVOLUTION_ENABLED`: Habilita logs da Evolution API
- `LOG_EVOLUTION_WEBHOOK`: Habilita logs de webhook

### Configurações do WhatsApp
- `WHATSAPP_MAX_CONCURRENT_CHATS`: Número máximo de chats simultâneos (padrão: 5)
- `WHATSAPP_AUTO_REPLY_ENABLED`: Habilita resposta automática
- `WHATSAPP_AUTO_REPLY_MESSAGE`: Mensagem de resposta automática
- `WHATSAPP_WORKING_HOURS_START`: Horário de início do atendimento (padrão: 09:00)
- `WHATSAPP_WORKING_HOURS_END`: Horário de fim do atendimento (padrão: 18:00)
- `WHATSAPP_WORKING_DAYS`: Dias de funcionamento (1-7, sendo 1=Segunda)

### Exemplo de Configuração

```env
# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_api_key_aqui
WEBHOOK_BASE_URL=https://seu-dominio.com/webhooks

# Configurações da Evolution API
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

# Logs
LOG_EVOLUTION_ENABLED=true
LOG_EVOLUTION_WEBHOOK=true
```

### Funcionalidades

#### 1. Gestão de Conexões
- QR Code para conexão
- Status da conexão
- Reconexão automática
- Monitoramento de sessões

#### 2. Mensagens
- Envio e recebimento
- Suporte a diferentes tipos (texto, imagem, vídeo, áudio, documento)
- Status de entrega e leitura
- Sistema de templates
- Retry automático em caso de falha

#### 3. Webhooks
- Eventos de mensagens
- Atualizações de status
- Notificações de conexão
- Validação de segurança

### Boas Práticas

#### 1. Segurança
- Nunca compartilhe suas chaves de API
- Use HTTPS para webhooks em produção
- Mantenha as chaves em variáveis de ambiente
- Implemente validação nos endpoints de webhook

#### 2. Performance
- Ajuste o número máximo de chats conforme necessidade
- Configure corretamente os horários de funcionamento
- Monitore os logs para identificar problemas
- Implemente cache quando apropriado

#### 3. Monitoramento
- Configure logs detalhados
- Monitore eventos de webhook
- Acompanhe métricas de performance
- Implemente alertas para falhas

#### 4. Armazenamento
- Habilite apenas o armazenamento necessário
- Monitore o uso de recursos
- Implemente limpeza periódica
- Configure backup dos dados importantes

## Sistema de Filas e Distribuição de Mensagens

### Visão Geral
O sistema implementa um mecanismo avançado de filas para gerenciar mensagens do WhatsApp e distribuí-las de forma eficiente entre os atendentes.

### Funcionalidades Principais

1. Priorização de Mensagens
   - Níveis: urgent, high, normal, low
   - Baseado em palavras-chave configuráveis
   - Suporte a números VIP
   - Prioridade dinâmica baseada em tempo de espera

2. Distribuição Balanceada
   - Algoritmo round-robin com balanceamento de carga
   - Consideração de capacidade dos agentes
   - Respeito a limites de chats concorrentes
   - Distribuição por departamento

3. Sistema de Retry
   - Tentativas configuráveis por mensagem
   - Delays progressivos entre tentativas
   - Fallback automático após falhas
   - Logging detalhado de retentativas

4. Monitoramento em Tempo Real
   - Tamanho das filas por departamento
   - Tempo médio de espera
   - Número de chats ativos
   - Disponibilidade de agentes

### Endpoints da API

#### Configuração de Filas
```
PUT /api/queues/:departmentId/config
- Atualiza configurações da fila
- Requer ROLE_ADMIN ou ROLE_SUPERVISOR
- Configurações de prioridade, retry e horário

GET /api/queues/:departmentId/config
- Obtém configurações atuais
- Requer autenticação
- Retorna configuração completa

GET /api/queues/:departmentId/stats
- Estatísticas em tempo real
- Requer autenticação
- Métricas de performance
```

### Configurações de Fila

1. Configurações Gerais
   ```typescript
   interface QueueConfig {
     maxConcurrentChats: number;
     autoCloseTimeout: number;
     priorityRules: {
       defaultPriority: MessagePriority;
       keywords: Record<string, MessagePriority>;
       vipNumbers: string[];
     };
     workingHours: {
       start: string;
       end: string;
       timezone: string;
       weekdays: number[];
     };
     retryConfig: {
       maxAttempts: number;
       delays: number[];
     };
   }
   ```

2. Prioridades de Mensagem
   - urgent: Mensagens críticas/emergenciais
   - high: Clientes VIP ou palavras-chave importantes
   - normal: Mensagens padrão
   - low: Mensagens não prioritárias

3. Configuração de Retry
   - Tentativas: 3 por padrão
   - Delays: 30s, 1min, 5min
   - Monitoramento contínuo
   - Notificação após falhas

### Boas Práticas

1. Monitoramento
   - Logging detalhado de eventos
   - Métricas de performance
   - Alertas de sobrecarga
   - Análise de distribuição

2. Otimização
   - Cache de configurações
   - Índices otimizados
   - Limpeza periódica
   - Compactação de dados

3. Segurança
   - Validação de inputs
   - Controle de acesso
   - Rate limiting
   - Auditoria de ações

### Próximas Implementações

2. Templates Avançados
   - Editor visual
   - Variáveis dinâmicas
   - Validação automática
   - Versionamento

3. Analytics
   - Métricas de entrega
   - Engajamento
   - Performance
   - Relatórios customizados

4. Integrações
   - CRM
   - Chatbot
   - Base de conhecimento
   - Sistemas externos

## Sistema de Logs

### Configuração
O sistema utiliza o Winston para gerenciamento de logs, com as seguintes características:

1. Níveis de Log
   - error: Erros críticos que afetam o funcionamento
   - warn: Avisos importantes mas não críticos
   - info: Informações gerais do sistema
   - debug: Informações detalhadas para desenvolvimento

2. Armazenamento
   - Logs gerais: `logs/advsac.log`
   - Logs de erro: `logs/error.log`
   - Rotação automática de arquivos (máximo 5MB por arquivo)
   - Mantém últimos 5 arquivos de cada tipo

3. Formato dos Logs
   - Ambiente de desenvolvimento: 
     - Console: Formato colorido e legível
     - Arquivo: Formato JSON
   - Ambiente de produção:
     - Apenas arquivo no formato JSON

4. Informações Registradas
   - Timestamp
   - Nível do log
   - Mensagem
   - Metadados relevantes
   - Para requisições HTTP:
     - Método
     - URL
     - Status
     - Duração
     - User Agent
     - IP do cliente

5. Segurança
   - Sanitização automática de dados sensíveis
   - Remoção de senhas, tokens e chaves
   - Limpeza de parâmetros e queries
   - Validação de tipos

6. Testes
   - Testes unitários para configuração
   - Testes de middleware de requisições
   - Testes de middleware de erros
   - Validação de sanitização

### Uso no Código
```typescript
import logger from './config/logger';

// Exemplos de uso
logger.info('Operação realizada com sucesso', { dados: resultado });
logger.error('Erro ao processar', { erro: error });
logger.debug('Depuração', { variaveis: debug });

// Os middlewares são aplicados automaticamente em app.ts
app.use(requestLogger);
app.use(errorLogger);
```

### Executando os Testes
```bash
# Executa todos os testes
npm test

# Executa testes com coverage
npm test -- --coverage
```

## Comunicação em Tempo Real

### Socket.IO
O sistema utiliza Socket.IO para comunicação em tempo real entre cliente e servidor:

#### Namespaces e Eventos

1. `/attendance`
   - Gerenciamento de atendimentos em tempo real
   - Eventos de conexão/desconexão de atendentes
   - Notificações de novas mensagens
   - Rooms por departamento (`department:${departmentId}`)

2. `/dashboard`
   - Atualizações em tempo real do dashboard
   - Métricas e estatísticas
   - Room global para atualizações (`dashboard-updates`)

3. `/queue`
   - Gerenciamento de filas de atendimento
   - Atualizações de status
   - Rooms por departamento (`queue:${departmentId}`)

4. `/evolution`
   - Gerenciamento de conexões WhatsApp
   - Status de mensagens
   - Eventos de webhook
   - Notificações de sessão

#### Eventos

##### Cliente para Servidor
```typescript
// Autenticação
'auth:login': (token: string) => void
'auth:logout': () => void

// Atendimento
'attendance:join': (departmentId: string) => void
'attendance:leave': (departmentId: string) => void
'attendance:typing': (data: { departmentId: string; userId: string }) => void

// Mensagens
'message:send': (message: Message) => void
'message:read': (messageId: string) => void

// Fila
'queue:join': (departmentId: string) => void
'queue:leave': (departmentId: string) => void
'queue:update': (departmentId: string) => void

// Dashboard
'dashboard:subscribe': () => void
'dashboard:unsubscribe': () => void

// Evolution API
'evolution:qr-code': (instanceId: string) => void
'evolution:status': (instanceId: string) => void
'evolution:message-status': (data: { messageId: string; status: string }) => void
'evolution:webhook-event': (data: WebhookEvent) => void
```

##### Servidor para Cliente
```typescript
// Autenticação
'auth:success': (userData: any) => void
'auth:error': (error: string) => void

// Atendimento
'attendance:updated': (data: { departmentId: string; status: string }) => void
'attendance:typing': (data: { departmentId: string; userId: string }) => void

// Mensagens
'message:received': (message: Message) => void
'message:sent': (message: Message) => void
'message:error': (error: string) => void

// Fila
'queue:updated': (data: { departmentId: string; metrics: QueueMetrics }) => void
'queue:processed': (data: { departmentId: string; messageId: string; success: boolean; error?: string }) => void

// Dashboard
'dashboard:metrics': (metrics: any) => void
'dashboard:error': (error: string) => void

// Evolution API
'evolution:qr-code-received': (data: { instanceId: string; qrcode: string }) => void
'evolution:status-update': (data: { instanceId: string; status: ConnectionStatus }) => void
'evolution:message-status-update': (data: { messageId: string; status: MessageStatus }) => void
'evolution:webhook-received': (data: WebhookEvent) => void
```

#### Tipos de Dados

```typescript
interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  direction: 'incoming' | 'outgoing';
  status: MessageStatus;
  timestamp: string;
  metadata?: any;
}

interface WebhookEvent {
  type: 'message' | 'status' | 'presence' | 'connection';
  instanceId: string;
  data: any;
  timestamp: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';
type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
```

#### Implementação
- Servidor Socket.IO integrado ao Express
- Tipagem forte com TypeScript
- Autenticação via JWT
- Logging detalhado de eventos
- Integração com Evolution API
- Mock para ambiente de testes
- CORS configurável via ambiente
- Tratamento de reconexão automática
- Rate limiting por cliente
- Compressão de dados
- Heartbeat para monitoramento

### Métricas em Tempo Real
O sistema mantém as seguintes métricas atualizadas em tempo real:
- Atendimentos ativos
- Atendimentos do dia
- Mensagens do dia
- Clientes novos
- Tempo médio de espera
- Tempo médio de atendimento
- Atendentes online
- Satisfação média
- Status das conexões WhatsApp
- Taxa de entrega de mensagens
- Performance dos webhooks

## Integração com Evolution API
- Base URL: https://apiwp.advsac.com/manager
- Documentação: https://doc.evolution-api.com/v1/api-reference/get-information

## Comandos de Build e Deploy

### Frontend
```bash
# Instalação de dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Start em produção
npm start
```

### Backend
```bash
# Instalação de dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Start em produção
npm start
```

## Atualizações do Sistema

### [Data: 05/02/2025]
- Criação inicial do projeto
- Estruturação de diretórios
- Documentação base
- Configuração completa das variáveis de ambiente
- Implementação do sistema de configuração centralizado
- Implementação do sistema de logs com Winston
  - Logs em arquivo e console
  - Rotação automática de arquivos
  - Middlewares para log de requisições e erros
- Melhorias no sistema de logs:
  - Adição de tipos específicos
  - Implementação de sanitização de dados
  - Adição de testes unitários
  - Melhor tratamento de erros
- Implementação do sistema de autenticação:
  - Registro e login de usuários
  - Autenticação JWT
  - Controle de acesso baseado em funções
  - Testes unitários completos
- Implementação do banco de dados:
  - Configuração do PostgreSQL com TypeORM
  - Entidades e repositórios
  - Sistema de migrações
  - Integração com sistema de autenticação

## Sistema de Comunicação em Tempo Real

### Socket.IO
O sistema utiliza Socket.IO para comunicação em tempo real entre o servidor e os clientes.

#### Namespaces e Eventos

1. `/attendance`
```typescript
// Servidor para Cliente
'attendance:updated': (data: { departmentId: string; status: string }) => void
'attendance:typing': (data: { departmentId: string; userId: string }) => void

// Cliente para Servidor
'attendance:join': (departmentId: string) => void
'attendance:leave': (departmentId: string) => void
'attendance:typing': (data: { departmentId: string; userId: string }) => void
```

2. `/dashboard`
```typescript
// Servidor para Cliente
'dashboard:metrics': (metrics: any) => void
'dashboard:error': (error: string) => void

// Cliente para Servidor
'dashboard:subscribe': () => void
'dashboard:unsubscribe': () => void
```

3. `/queue`
```typescript
// Servidor para Cliente
'queue:updated': (data: { departmentId: string; metrics: QueueMetrics }) => void
'queue:processed': (data: { departmentId: string; messageId: string; success: boolean; error?: string }) => void

// Cliente para Servidor
'queue:join': (departmentId: string) => void
'queue:leave': (departmentId: string) => void
'queue:update': (departmentId: string) => void
```

4. `/evolution`
```typescript
// Servidor para Cliente
'evolution:qr-code-received': (data: { instanceId: string; qrcode: string }) => void
'evolution:status-update': (data: { instanceId: string; status: ConnectionStatus }) => void
'evolution:message-status-update': (data: { messageId: string; status: MessageStatus }) => void
'evolution:webhook-received': (data: WebhookEvent) => void

// Cliente para Servidor
'evolution:qr-code': (instanceId: string) => void
'evolution:status': (instanceId: string) => void
'evolution:message-status': (data: { messageId: string; status: string }) => void
'evolution:webhook-event': (data: WebhookEvent) => void
```

#### Tipos de Dados

```typescript
interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  direction: 'incoming' | 'outgoing';
  status: MessageStatus;
  timestamp: string;
  metadata?: any;
}

interface WebhookEvent {
  type: 'message' | 'status' | 'presence' | 'connection';
  instanceId: string;
  data: any;
  timestamp: string;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';
type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
```

#### Implementação
- Servidor Socket.IO integrado ao Express
- Tipagem forte com TypeScript
- Autenticação via JWT
- Logging detalhado de eventos
- Integração com Evolution API
- Mock para ambiente de testes
- CORS configurável via ambiente
- Tratamento de reconexão automática
- Rate limiting por cliente
- Compressão de dados
- Heartbeat para monitoramento

### Métricas em Tempo Real
O sistema mantém as seguintes métricas atualizadas em tempo real:
- Atendimentos ativos
- Atendimentos do dia
- Mensagens do dia
- Clientes novos
- Tempo médio de espera
- Tempo médio de atendimento
- Atendentes online
- Satisfação média
- Status das conexões WhatsApp
- Taxa de entrega de mensagens
- Performance dos webhooks

## Integração com Evolution API

### Configuração
O sistema utiliza as seguintes variáveis de ambiente para a Evolution API:
```env
EVOLUTION_API_KEY=sua_chave_api
EVOLUTION_API_BASE_URL=url_da_api
WEBHOOK_BASE_URL=url_para_webhooks
```

### Funcionalidades
1. Gestão de Conexões
   - QR Code para conexão
   - Status da conexão
   - Reconexão automática

2. Mensagens
   - Envio e recebimento
   - Suporte a diferentes tipos (texto, imagem, vídeo, áudio, documento)
   - Status de entrega e leitura
   - Metadados personalizados

3. Webhooks
   - Eventos de mensagens
   - Atualizações de status
   - Notificações de conexão

### Sistema de Filas
1. Configurações
   - Tentativas de reenvio: 3 (padrão)
   - Delay entre tentativas: 5000ms
   - Intervalo de processamento: 1000ms

2. Horário de Funcionamento
   - Início: 09:00 (padrão)
   - Fim: 18:00 (padrão)
   - Dias úteis: Segunda a Sexta

3. Atendimento
   - Máximo de chats simultâneos: 5 (padrão)
   - Resposta automática configurável
   - Sistema de tags para categorização

## Sistema de Filas e Distribuição

### Visão Geral
O sistema implementa um mecanismo robusto de filas para gerenciamento de mensagens e distribuição de atendimentos, utilizando priorização inteligente e balanceamento de carga.

### Configuração
```typescript
interface QueueConfig {
    maxConcurrentChats: number;     // Máximo de chats simultâneos por agente
    autoCloseTimeout: number;       // Tempo para auto-fechamento de chat inativo
    priorityRules: {
        defaultPriority: 'low' | 'normal' | 'high' | 'urgent';
        keywords: Record<string, MessagePriority>;  // Palavras-chave -> prioridade
        vipNumbers: string[];       // Números com prioridade alta
    };
    workingHours: {
        start: string;             // Formato HH:mm
        end: string;               // Formato HH:mm
        timezone: string;
        weekdays: number[];        // 0-6 (0 = domingo)
    };
    retryConfig: {
        maxAttempts: number;       // Máximo de tentativas
        delays: number[];          // Delays em ms entre tentativas
    };
}
```

### Endpoints da API

#### Estatísticas da Fila
```
GET /api/queues/:departmentId/stats
- Retorna estatísticas em tempo real
- Inclui tamanho da fila, chats ativos, tempo médio de espera
- Requer autenticação
```

#### Gerenciamento de Mensagens
```
POST /api/queues/:departmentId/messages
- Adiciona mensagem à fila
- Suporta definição de prioridade
- Requer autenticação

PUT /api/queues/:departmentId/messages/:messageId/priority
- Atualiza prioridade da mensagem
- Requer autenticação

DELETE /api/queues/:departmentId/messages/:messageId
- Remove mensagem da fila
- Requer autenticação
```

#### Gestão de Chats
```
POST /api/queues/chats/:chatId/finish
- Finaliza um chat ativo
- Libera agente para novo atendimento
- Requer autenticação

GET /api/queues/:departmentId/config
- Retorna configuração da fila
- Requer autenticação
```

### Sistema de Priorização

1. **Níveis de Prioridade**
   - Urgente: Atendimento imediato
   - Alta: Prioridade sobre normais
   - Normal: Fluxo padrão
   - Baixa: Menor prioridade

2. **Regras de Priorização**
   - Palavras-chave configuráveis
   - Números VIP
   - Histórico do cliente
   - Horário de funcionamento

3. **Distribuição de Carga**
   - Balanceamento por número de chats
   - Consideração de status do agente
   - Respeito a limites configurados
   - Métricas em tempo real

### Sistema de Retry

1. **Configuração**
   - Tentativas máximas configuráveis
   - Delays progressivos entre tentativas
   - Logging de falhas

2. **Processo de Retry**
   - Fila separada para mensagens falhas
   - Tentativas em intervalos crescentes
   - Notificação de falhas persistentes

### Métricas e Monitoramento

1. **Métricas em Tempo Real**
   - Tamanho da fila
   - Distribuição de prioridades
   - Tempo médio de espera
   - Chats ativos por agente

2. **Eventos Socket.IO**
   - queue:metrics: Métricas atualizadas
   - queue:updated: Alterações na fila
   - chat:assigned: Novo chat atribuído
   - chat:updated: Atualizações de status

3. **Logs e Auditoria**
   - Registro de operações
   - Tracking de falhas
   - Métricas de performance
   - Histórico de distribuição

```
