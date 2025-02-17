import { Message } from '../entities/message.entity';
import { QueueMetrics } from './queue.types';
import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

// Tipo para callbacks
interface CallbackResponse {
    success: boolean;
    error?: string;
}

// Tipos de Status
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

// Interfaces de Mensagem
export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  direction: 'incoming' | 'outgoing';
  status: MessageStatus;
  timestamp: string;
  metadata?: any;
}

// Interfaces de Eventos da Evolution API
export interface WebhookEvent {
  type: 'message' | 'status' | 'presence' | 'connection';
  instanceId: string;
  data: any;
  timestamp: string;
}

export interface QRCodeData {
  instanceId: string;
  qrcode: string;
}

export interface StatusUpdateData {
  instanceId: string;
  status: ConnectionStatus;
}

export interface MessageStatusData {
  messageId: string;
  status: MessageStatus;
}

// Eventos do cliente para o servidor
export interface ClientToServerEvents {
    // Eventos de autenticação
    'auth:login': (token: string, callback?: (response: CallbackResponse) => void) => void;
    'auth:logout': (callback?: (response: CallbackResponse) => void) => void;

    // Eventos de atendimento
    'attendance:join': (departmentId: string, callback?: (response: CallbackResponse) => void) => void;
    'attendance:leave': (departmentId: string, callback?: (response: CallbackResponse) => void) => void;
    'attendance:typing': (data: { departmentId: string; userId: string }, callback?: (response: CallbackResponse) => void) => void;

    // Eventos de mensagens
    'message:send': (message: Message, callback?: (response: CallbackResponse & { messageId?: string }) => void) => void;
    'message:read': (messageId: string, callback?: (response: CallbackResponse) => void) => void;

    // Eventos de fila
    'queue:join': (departmentId: string, callback?: (response: CallbackResponse) => void) => void;
    'queue:leave': (departmentId: string, callback?: (response: CallbackResponse) => void) => void;
    'queue:update': (departmentId: string, callback?: (response: CallbackResponse) => void) => void;

    // Eventos de dashboard
    'dashboard:subscribe': (callback?: (response: CallbackResponse) => void) => void;
    'dashboard:unsubscribe': (callback?: (response: CallbackResponse) => void) => void;

    // Evolution API Events
    'evolution:qr-code': (instanceId: string) => void;
    'evolution:status': (instanceId: string) => void;
    'evolution:message-status': (data: MessageStatusData) => void;
    'evolution:webhook-event': (data: WebhookEvent) => void;
}

// Eventos do servidor para o cliente
export interface ServerToClientEvents {
    // Eventos de autenticação
    'auth:success': (userData: any) => void;
    'auth:error': (error: string) => void;

    // Eventos de atendimento
    'attendance:updated': (data: { departmentId: string; status: string }) => void;
    'attendance:typing': (data: { departmentId: string; userId: string }) => void;

    // Eventos de mensagens
    'message:received': (message: Message) => void;
    'message:sent': (message: Message) => void;
    'message:error': (error: string) => void;

    // Eventos de fila
    'queue:updated': (data: { departmentId: string; metrics: QueueMetrics }) => void;
    'queue:processed': (data: { departmentId: string; messageId: string; success: boolean; error?: string }) => void;

    // Eventos de dashboard
    'dashboard:metrics': (metrics: any) => void;
    'dashboard:error': (error: string) => void;

    // Evolution API Events
    'evolution:qr-code-received': (data: QRCodeData) => void;
    'evolution:status-update': (data: StatusUpdateData) => void;
    'evolution:message-status-update': (data: MessageStatusData) => void;
    'evolution:webhook-received': (data: WebhookEvent) => void;

    // Eventos gerais
    'error': (error: { message: string }) => void;
    'reconnect': () => void;
    'reconnect_error': (error: Error) => void;
    'reconnect_failed': () => void;
}

// Eventos entre servidores
export interface InterServerEvents {
    ping: () => void;
    broadcast: (event: string, data: any) => void;
}

// Dados do socket
export interface SocketData {
    userId: string;
    departmentId?: string;
    role: string;
    authenticated?: boolean;
    lastActivity?: Date;
    user?: any;
    auth?: {
        token: string;
    };
}

export type IOServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type IOSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
