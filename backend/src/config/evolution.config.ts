import env from './env';
import { RetryConfig } from '../types/evolution.retry.types';

export interface EvolutionConfig {
    baseUrl: string;
    apiKey: string;
    serverUrl: string;
    authentication: {
        type: string;
        apiKey: string;
    };
    webhook: {
        enabled: boolean;
        globalUrl: string;
        events: {
            messagesUpsert: boolean;
            messagesUpdate: boolean;
            messagesDelete: boolean;
            presenceUpdate: boolean;
            connectionUpdate: boolean;
        };
    };
    store: {
        messages: boolean;
        messageUp: boolean;
        contacts: boolean;
    };
    websocket: {
        enabled: boolean;
    };
    logs: {
        enabled: boolean;
        webhookLogs: boolean;
    };
    retry: RetryConfig;
    monitoring: {
        enabled: boolean;
        checkIntervalMs: number;
        maxMetricsHistory: number;
    };
    whatsapp: {
        maxConcurrentChats: number;
        autoReply: {
            enabled: boolean;
            message: string;
        };
        workingHours: {
            start: string;
            end: string;
            days: number[];
        };
    };
}

const evolutionConfig: EvolutionConfig = {
    baseUrl: env.evolution.baseUrl,
    apiKey: env.evolution.apiKey,
    serverUrl: env.evolution.serverUrl,
    authentication: {
        type: env.evolution.authenticationType,
        apiKey: env.evolution.authenticationApiKey,
    },
    webhook: {
        enabled: env.evolution.webhookEnabled,
        globalUrl: env.evolution.webhookGlobalUrl,
        events: {
            messagesUpsert: env.evolution.webhookEventsMessagesUpsert,
            messagesUpdate: env.evolution.webhookEventsMessagesUpdate,
            messagesDelete: env.evolution.webhookEventsMessagesDelete,
            presenceUpdate: env.evolution.webhookEventsPresenceUpdate,
            connectionUpdate: env.evolution.webhookEventsConnectionUpdate,
        },
    },
    store: {
        messages: env.evolution.storeMessages,
        messageUp: env.evolution.storeMessageUp,
        contacts: env.evolution.storeContacts,
    },
    websocket: {
        enabled: env.evolution.websocketEnabled,
    },
    logs: {
        enabled: env.evolution.logsEnabled,
        webhookLogs: env.evolution.logsWebhook,
    },
    retry: {
        maxAttempts: Number(env.evolution.retryMaxAttempts) || 3,
        delayMs: Number(env.evolution.retryDelayMs) || 1000,
        backoffFactor: Number(env.evolution.retryBackoffFactor) || 2,
        maxDelayMs: Number(env.evolution.retryMaxDelayMs) || 30000
    },
    monitoring: {
        enabled: env.evolution.monitoringEnabled === 'true',
        checkIntervalMs: Number(env.evolution.monitoringIntervalMs) || 5000,
        maxMetricsHistory: Number(env.evolution.monitoringMaxHistory) || 1000
    },
    whatsapp: {
        maxConcurrentChats: env.whatsapp.maxConcurrentChats,
        autoReply: {
            enabled: env.whatsapp.autoReplyEnabled,
            message: env.whatsapp.autoReplyMessage
        },
        workingHours: {
            start: env.whatsapp.workingHoursStart,
            end: env.whatsapp.workingHoursEnd,
            days: env.whatsapp.workingDays.split(',').map(Number)
        }
    }
};

export default evolutionConfig;
