import dotenv from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env apropriado
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
const envPath = path.join(__dirname, '../../', envFile);
dotenv.config({ path: envPath });

const env = {
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    cors: {
      origin: process.env.CORS_ORIGIN || '*'
    }
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'advsac',
    testDatabase: process.env.DB_TEST_NAME || 'advsac_test',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
    dropSchema: process.env.DB_DROP_SCHEMA === 'true'
  },
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    prefix: process.env.REDIS_PREFIX || 'advsac',
    ttl: parseInt(process.env.REDIS_TTL || '3600')
  },
  whatsapp: {
    maxConcurrentChats: parseInt(process.env.WHATSAPP_MAX_CONCURRENT_CHATS || '5'),
    autoReplyEnabled: process.env.WHATSAPP_AUTO_REPLY_ENABLED === 'true',
    autoReplyMessage: process.env.WHATSAPP_AUTO_REPLY_MESSAGE || 'Olá! Em breve um de nossos advogados irá atendê-lo.',
    workingHoursStart: process.env.WHATSAPP_WORKING_HOURS_START || '09:00',
    workingHoursEnd: process.env.WHATSAPP_WORKING_HOURS_END || '18:00',
    workingDays: process.env.WHATSAPP_WORKING_DAYS || '1,2,3,4,5'
  },
  queue: {
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
    retryDelays: (process.env.QUEUE_RETRY_DELAYS || '1000,5000,15000').split(',').map(Number)
  },
  evolution: {
    baseUrl: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: process.env.EVOLUTION_API_KEY || 'your-api-key',
    webhookUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000/webhooks',
    serverUrl: process.env.EVOLUTION_SERVER_URL || 'http://localhost:8080',
    authenticationType: process.env.EVOLUTION_AUTHENTICATION_TYPE || 'apikey',
    authenticationApiKey: process.env.EVOLUTION_AUTHENTICATION_API_KEY || 'your-api-key',
    webhookEnabled: process.env.EVOLUTION_WEBHOOK_ENABLED === 'true',
    webhookGlobalUrl: process.env.EVOLUTION_WEBHOOK_GLOBAL_URL || 'http://localhost:3000/webhooks/evolution',
    webhookEventsMessagesUpsert: process.env.EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPSERT === 'true',
    webhookEventsMessagesUpdate: process.env.EVOLUTION_WEBHOOK_EVENTS_MESSAGES_UPDATE === 'true',
    webhookEventsMessagesDelete: process.env.EVOLUTION_WEBHOOK_EVENTS_MESSAGES_DELETE === 'true',
    webhookEventsPresenceUpdate: process.env.EVOLUTION_WEBHOOK_EVENTS_PRESENCE_UPDATE === 'true',
    webhookEventsConnectionUpdate: process.env.EVOLUTION_WEBHOOK_EVENTS_CONNECTION_UPDATE === 'true',
    storeMessages: process.env.EVOLUTION_STORE_MESSAGES === 'true',
    storeMessageUp: process.env.EVOLUTION_STORE_MESSAGE_UP === 'true',
    storeContacts: process.env.EVOLUTION_STORE_CONTACTS === 'true',
    websocketEnabled: process.env.EVOLUTION_WEBSOCKET_ENABLED === 'true',
    logsEnabled: process.env.LOG_EVOLUTION_ENABLED === 'true',
    logsWebhook: process.env.LOG_EVOLUTION_WEBHOOK === 'true'
  }
};

export default env;
