# Configuração do Banco de Dados

## PostgreSQL

### Configurações Padrão
```env
# Desenvolvimento
HOST=localhost
PORT=5432
DATABASE=advsac_dev
USER=postgres
PASSWORD=postgres
SSL=false

# Produção
DATABASE_URL=postgresql://user:password@host:5432/advsac_prod
SSL=true
```

## TypeORM

### Configuração Base
O arquivo `src/config/database.config.ts` centraliza as configurações:

```typescript
const databaseConfig = {
  development: {
    type: 'postgres',
    synchronize: true,
    logging: true,
    entities: ['src/models/**/*.ts'],
    migrations: ['src/migrations/**/*.ts'],
    subscribers: ['src/subscribers/**/*.ts'],
    cli: {
      entitiesDir: 'src/models',
      migrationsDir: 'src/migrations',
      subscribersDir: 'src/subscribers'
    },
    pool: {
      max: 10,
      min: 1
    }
  },
  production: {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    ssl: true,
    entities: ['dist/models/**/*.js'],
    migrations: ['dist/migrations/**/*.js'],
    subscribers: ['dist/subscribers/**/*.js'],
    pool: {
      max: 20,
      min: 1
    }
  }
};
```

## Redis (Cache)

### Requisitos
- Redis Server 7.0+
- Porta: 6379
- Autenticação obrigatória
- Memória máxima: 2GB

### Configuração
```typescript
const redisConfig = {
  url: process.env.REDIS_URL,
  password: process.env.REDIS_PASSWORD,
  prefix: 'advsac:',
  ttl: 3600,
  maxmemory: '2gb',
  policy: 'allkeys-lru',
  persistence: {
    aof: true,
    backup: {
      enabled: true,
      interval: '24h'
    }
  }
};
```

## Migrations

### Criar Migration
```bash
npm run typeorm migration:create -- -n CreateUsersTable
```

### Exemplo de Migration
```typescript
export class CreateUsersTable1234567890 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "email",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "password",
                    type: "varchar"
                },
                {
                    name: "role",
                    type: "varchar"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("users");
    }
}
```

## Índices e Performance

### Índices Recomendados
```sql
-- Usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Atendimentos
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- Mensagens
CREATE INDEX idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### Pool de Conexões
```typescript
const poolConfig = {
  development: {
    max: 10,
    min: 1,
    idleTimeoutMillis: 30000
  },
  production: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000
  }
};
```

## Backup e Recuperação

### Backup Automático
```bash
# Backup diário
0 0 * * * pg_dump -Fc advsac > /backups/advsac_$(date +%Y%m%d).dump

# Manter últimos 7 dias
find /backups/ -name "advsac_*.dump" -mtime +7 -delete
```

### Restauração
```bash
pg_restore -d advsac backup_file.dump
```

## Monitoramento

### Queries Lentas
```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE pg_stat_activity.query != ''::text 
  AND state != 'idle' 
  AND now() - pg_stat_activity.query_start > interval '5 minutes'
ORDER BY duration DESC;
```

### Tamanho das Tabelas
```sql
SELECT 
    relname as "Table",
    pg_size_pretty(pg_total_relation_size(relid)) As "Size",
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as "External Size"
FROM pg_catalog.pg_statio_user_tables 
ORDER BY pg_total_relation_size(relid) DESC;
```

## Troubleshooting

### Problemas Comuns

1. **Conexões**
   - Verificar pool de conexões
   - Validar credenciais
   - Checar firewall

2. **Performance**
   - Analisar queries lentas
   - Verificar índices
   - Otimizar consultas

3. **Disco**
   - Monitorar espaço
   - Limpar logs antigos
   - Arquivar dados
