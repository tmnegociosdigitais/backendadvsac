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

## Estratégia de Armazenamento e Cache

### Visão Geral
O sistema utiliza uma arquitetura de três camadas para otimizar o armazenamento e acesso aos dados:

1. **Banco de Dados Local (PostgreSQL)**
   - Armazena as 100 mensagens mais recentes por cliente
   - Dados de clientes ativos
   - Metadados de conversas
   - Configurações do sistema

2. **Sistema de Cache (Redis)**
   - Cache de mensagens das últimas 24 horas
   - Status de clientes e conversas
   - Dados de sessão
   - Cache de configurações

3. **Armazenamento de Histórico (Evolution API)**
   - Histórico completo de mensagens
   - Backup de longo prazo
   - Dados históricos de clientes

### Políticas de Retenção

#### Mensagens no Banco Local
- Limite: 100 mensagens mais recentes por cliente
- Remoção automática das mensagens mais antigas
- Prioridade para mensagens não lidas ou importantes

#### Cache
- TTL (Time To Live):
  * Mensagens recentes: 24 horas
  * Status de cliente: 30 minutos
  * Configurações: 1 hora
- Limite de itens por cliente: 100

#### Sincronização
- Sincronização periódica com Evolution API
- Carregamento sob demanda de mensagens antigas
- Backup diário do banco local

### Estrutura das Tabelas

#### Messages
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'incoming' ou 'outgoing'
  status VARCHAR(10) NOT NULL, -- 'sent', 'delivered', 'read'
  evolution_api_message_id VARCHAR(100) NOT NULL,
  message_order INTEGER NOT NULL,
  CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT messages_per_client CHECK (message_order <= 100)
);
```

#### Clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  whatsapp_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  last_interaction TIMESTAMP NOT NULL,
  last_message TEXT,
  conversation_status VARCHAR(10) NOT NULL -- 'active' ou 'inactive'
);
```

### Implementação
- Uso de Socket.IO para atualizações em tempo real
- Sistema de filas para processamento assíncrono
- Middleware de cache para otimização de performance
- Logs de auditoria para operações críticas

### Benefícios
- Alta performance no acesso a dados recentes
- Economia de recursos do banco de dados
- Escalabilidade do sistema
- Backup confiável via Evolution API
- Experiência do usuário otimizada

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

1. Dashboard
   - Atualização em tempo real de métricas
   - Notificações de eventos importantes

2. Atendimentos
   - Status de conversas em tempo real
   - Notificações de novas mensagens
   - Atualizações de status do WhatsApp

3. CRM Kanban
   - Atualizações em tempo real do quadro
   - Notificações de movimentação de cards
   - Status de atendimento

### Implementação
- Servidor Socket.IO integrado ao Express
- Namespaces por funcionalidade
- Rooms para grupos de usuários
- Middleware de autenticação
- Tratamento de reconexão

## Configuração do Ambiente

### Variáveis de Ambiente
O sistema utiliza um arquivo `.env` para configuração. Um arquivo `.env.example` é fornecido com todas as variáveis necessárias:

1. Configurações do Servidor
   - `PORT`: Porta do servidor (padrão: 3001)
   - `NODE_ENV`: Ambiente de execução (development/production)

2. Configurações do JWT
   - `JWT_SECRET`: Chave secreta para tokens JWT
   - `JWT_EXPIRATION`: Tempo de expiração dos tokens

3. Configurações do Banco de Dados
   - `DB_HOST`: Host do banco de dados
   - `DB_PORT`: Porta do banco de dados
   - `DB_NAME`: Nome do banco de dados
   - `DB_USER`: Usuário do banco de dados
   - `DB_PASSWORD`: Senha do banco de dados

4. Configurações da Evolution API
   - `EVOLUTION_API_URL`: URL base da API
   - `EVOLUTION_API_KEY`: Chave de autenticação

5. Configurações de Log
   - `LOG_LEVEL`: Nível de log (debug/info/warn/error)
   - `LOG_FILE_PATH`: Caminho para arquivo de log

6. Configurações de Rate Limit
   - `RATE_LIMIT_WINDOW`: Janela de tempo para rate limit
   - `RATE_LIMIT_MAX_REQUESTS`: Número máximo de requisições

7. Configurações de CORS
   - `CORS_ORIGIN`: Origem permitida para CORS

8. Configurações de Upload
   - `MAX_FILE_SIZE`: Tamanho máximo de arquivo
   - `UPLOAD_PATH`: Diretório para uploads

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
