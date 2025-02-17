import { Message } from '../entities/message.entity';
import { QueueMetrics } from './queue.types';
import { Socket } from 'socket.io-client';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ConnectionStatus,
  MessageStatus,
  Message as EvolutionMessage,
  WebhookEvent,
  QRCodeData,
  StatusUpdateData,
  MessageStatusData
} from './socket.types';

/**
 * Tipos para integração com o frontend
 * Estes tipos serão exportados e disponibilizados para o frontend usar
 */

// Status da conexão Socket.IO
export interface SocketConnectionStatus {
    connected: boolean;
    transport?: string;
    lastConnected?: Date;
    reconnectAttempts?: number;
}

// Métricas do dashboard em tempo real
export interface DashboardMetrics {
    activeUsers: number;
    pendingChats: number;
    resolvedChats: number;
    averageResponseTime: number;
    queueMetrics: QueueMetrics;
}

// Status de atendimento
export interface AttendanceStatus {
    departmentId: string;
    userId: string;
    status: 'online' | 'offline' | 'busy';
    lastActivity: Date;
}

// Notificação em tempo real
export interface RealTimeNotification {
    id: string;
    type: 'message' | 'queue' | 'system';
    title: string;
    message: string;
    timestamp: Date;
    data?: any;
}

// Eventos que o frontend pode emitir
export interface FrontendEmitEvents {
    // Autenticação
    'auth:login': (token: string) => Promise<void>;
    'auth:logout': () => Promise<void>;

    // Atendimento
    'attendance:join': (departmentId: string) => Promise<void>;
    'attendance:leave': (departmentId: string) => Promise<void>;
    'attendance:typing': (data: { departmentId: string; userId: string }) => Promise<void>;

    // Mensagens
    'message:send': (message: Message) => Promise<{ messageId: string }>;
    'message:read': (messageId: string) => Promise<void>;

    // Fila
    'queue:join': (departmentId: string) => Promise<void>;
    'queue:leave': (departmentId: string) => Promise<void>;
    'queue:update': (departmentId: string) => Promise<void>;

    // Dashboard
    'dashboard:subscribe': () => Promise<void>;
    'dashboard:unsubscribe': () => Promise<void>;
}

// Eventos que o frontend pode receber
export interface FrontendListenEvents {
    // Autenticação
    'auth:success': (userData: any) => void;
    'auth:error': (error: string) => void;

    // Atendimento
    'attendance:updated': (data: AttendanceStatus) => void;
    'attendance:typing': (data: { departmentId: string; userId: string }) => void;

    // Mensagens
    'message:received': (message: Message) => void;
    'message:sent': (message: Message) => void;
    'message:error': (error: string) => void;

    // Fila
    'queue:updated': (data: { departmentId: string; metrics: QueueMetrics }) => void;
    'queue:processed': (data: { departmentId: string; messageId: string; success: boolean; error?: string }) => void;

    // Dashboard
    'dashboard:metrics': (metrics: DashboardMetrics) => void;
    'dashboard:error': (error: string) => void;

    // Notificações
    'notification:new': (notification: RealTimeNotification) => void;

    // Eventos de conexão
    'connect': () => void;
    'disconnect': (reason: string) => void;
    'connect_error': (error: Error) => void;
    'reconnect': (attemptNumber: number) => void;
    'reconnect_attempt': (attemptNumber: number) => void;
    'reconnect_error': (error: Error) => void;
    'reconnect_failed': () => void;
}

// Namespace específico para o frontend
export interface FrontendNamespaces {
    attendance: {
        emit: FrontendEmitEvents;
        on: FrontendListenEvents;
    };
    dashboard: {
        emit: FrontendEmitEvents;
        on: FrontendListenEvents;
    };
    queue: {
        emit: FrontendEmitEvents;
        on: FrontendListenEvents;
    };
    evolution: {
        emit: ClientToServerEvents;
        on: ServerToClientEvents;
    };
}

// Re-export dos tipos comuns
export {
  ConnectionStatus,
  MessageStatus,
  EvolutionMessage as EvolutionMessage,
  WebhookEvent,
  QRCodeData,
  StatusUpdateData,
  MessageStatusData
};

// Socket do cliente
export type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Hooks e utilidades para Evolution API
export interface UseEvolutionSocket {
  connectInstance: (instanceId: string) => Promise<void>;
  getQRCode: (instanceId: string) => Promise<string>;
  getStatus: (instanceId: string) => Promise<ConnectionStatus>;
  getMessageStatus: (messageId: string) => Promise<MessageStatus>;
  onWebhookEvent: (callback: (event: WebhookEvent) => void) => void;
  onStatusChange: (callback: (data: StatusUpdateData) => void) => void;
  onMessageStatusUpdate: (callback: (data: MessageStatusData) => void) => void;
  onQRCodeReceived: (callback: (data: QRCodeData) => void) => void;
}

// Hooks e utilidades para outros namespaces
export interface UseAttendanceSocket {
  // Implementação existente...
}

export interface UseDashboardSocket {
  // Implementação existente...
}

export interface UseQueueSocket {
  // Implementação existente...
}

// Configuração do socket
export interface SocketConfig {
  url: string;
  options: {
    auth: {
      token: string;
    };
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    timeout: number;
  };
}
