import { WhatsAppInstanceStatus } from './department';

export interface WhatsAppSession {
    instanceId: string;
    name: string;
    status: WhatsAppInstanceStatus;
    qrCode?: string;
    connectionInfo?: {
        phoneNumber: string;
        pushName: string;
        profilePictureUrl?: string;
    };
    lastConnection?: Date;
    connectionAttempts: number;
    webhookUrl?: string;
    settings: WhatsAppSessionSettings;
}

export interface WhatsAppSessionSettings {
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    webhookEnabled: boolean;
    notificationEvents: string[];
    messageRetention: number; // dias
}

export interface QRCodeResponse {
    qrCode: string;
    expiresAt: Date;
}

export interface SessionConnectionInfo {
    success: boolean;
    error?: string;
    connectionInfo?: WhatsAppSession['connectionInfo'];
}

export interface SessionEvent {
    type: 'connection' | 'qr' | 'message' | 'status';
    instanceId: string;
    timestamp: Date;
    data: any;
}

export type SessionEventHandler = (event: SessionEvent) => Promise<void> | void;
