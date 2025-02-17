import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WhatsAppInstance } from '../entities/whatsapp.entity';
import { WhatsAppInstanceStatus } from '../types/department';
import { 
    WhatsAppSession, 
    QRCodeResponse, 
    SessionConnectionInfo,
    SessionEvent,
    SessionEventHandler 
} from '../types/whatsapp-session';
import { EvolutionService } from './evolution.service';
import { LoggerService } from './logger.service';

@Injectable()
export class WhatsAppSessionService {
    private sessions: Map<string, WhatsAppSession> = new Map();
    private eventHandlers: Map<string, Set<SessionEventHandler>> = new Map();

    constructor(
        @InjectRepository(WhatsAppInstance)
        private instanceRepository: Repository<WhatsAppInstance>,
        private evolutionService: EvolutionService,
        private logger: LoggerService,
        private eventEmitter: EventEmitter2
    ) {
        this.initializeEventHandlers();
    }

    private initializeEventHandlers(): void {
        // Carrega as instâncias existentes do banco
        this.loadExistingSessions();

        // Configura handlers para eventos da Evolution API
        this.eventEmitter.on('whatsapp.qr', this.handleQRCode.bind(this));
        this.eventEmitter.on('whatsapp.connection', this.handleConnection.bind(this));
        this.eventEmitter.on('whatsapp.message', this.handleMessage.bind(this));
    }

    async loadExistingSessions(): Promise<void> {
        try {
            const instances = await this.instanceRepository.find();
            for (const instance of instances) {
                await this.initializeSession(instance);
            }
            this.logger.info(`Carregadas ${instances.length} sessões existentes`);
        } catch (error) {
            this.logger.error('Erro ao carregar sessões existentes:', error);
        }
    }

    async initializeSession(instance: WhatsAppInstance): Promise<WhatsAppSession> {
        const session: WhatsAppSession = {
            instanceId: instance.id,
            name: instance.name,
            status: instance.status,
            qrCode: instance.qrCode,
            lastConnection: instance.lastConnection,
            connectionAttempts: 0,
            settings: {
                autoReconnect: true,
                maxReconnectAttempts: 3,
                webhookEnabled: true,
                notificationEvents: ['message', 'status', 'connection'],
                messageRetention: 30
            }
        };

        this.sessions.set(instance.id, session);
        return session;
    }

    async createSession(name: string, ownerId: string): Promise<WhatsAppSession> {
        // Cria nova instância no banco
        const instance = this.instanceRepository.create({
            name,
            ownerId,
            status: WhatsAppInstanceStatus.DISCONNECTED
        });
        await this.instanceRepository.save(instance);

        // Inicializa sessão
        const session = await this.initializeSession(instance);
        
        // Inicia conexão com Evolution API
        await this.evolutionService.createInstance(instance.id);

        return session;
    }

    async connectSession(instanceId: string): Promise<QRCodeResponse> {
        const session = this.sessions.get(instanceId);
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        try {
            // Solicita QR Code da Evolution API
            const qrResponse = await this.evolutionService.connectInstance(instanceId);
            
            // Atualiza sessão e banco
            session.status = WhatsAppInstanceStatus.WAITING_QR;
            session.qrCode = qrResponse.qrCode;
            await this.updateInstanceStatus(instanceId, session.status, qrResponse.qrCode);

            return {
                qrCode: qrResponse.qrCode,
                expiresAt: new Date(Date.now() + 60000) // QR Code expira em 1 minuto
            };
        } catch (error) {
            this.logger.error(`Erro ao conectar sessão ${instanceId}:`, error);
            throw error;
        }
    }

    async disconnectSession(instanceId: string): Promise<void> {
        const session = this.sessions.get(instanceId);
        if (!session) {
            throw new Error('Sessão não encontrada');
        }

        try {
            await this.evolutionService.disconnectInstance(instanceId);
            session.status = WhatsAppInstanceStatus.DISCONNECTED;
            session.qrCode = undefined;
            session.connectionInfo = undefined;
            await this.updateInstanceStatus(instanceId, session.status);
        } catch (error) {
            this.logger.error(`Erro ao desconectar sessão ${instanceId}:`, error);
            throw error;
        }
    }

    private async updateInstanceStatus(
        instanceId: string, 
        status: WhatsAppInstanceStatus, 
        qrCode?: string
    ): Promise<void> {
        await this.instanceRepository.update(instanceId, {
            status,
            qrCode,
            lastConnection: status === WhatsAppInstanceStatus.CONNECTED ? new Date() : undefined
        });
    }

    private async handleQRCode(event: SessionEvent): Promise<void> {
        const { instanceId, data: { qrCode } } = event;
        const session = this.sessions.get(instanceId);
        if (session) {
            session.qrCode = qrCode;
            session.status = WhatsAppInstanceStatus.WAITING_QR;
            await this.updateInstanceStatus(instanceId, session.status, qrCode);
        }
    }

    private async handleConnection(event: SessionEvent): Promise<void> {
        const { instanceId, data: connectionInfo } = event;
        const session = this.sessions.get(instanceId);
        if (session) {
            session.connectionInfo = connectionInfo;
            session.status = WhatsAppInstanceStatus.CONNECTED;
            session.lastConnection = new Date();
            await this.updateInstanceStatus(instanceId, session.status);
        }
    }

    private async handleMessage(event: SessionEvent): Promise<void> {
        // Delega para handlers registrados
        const handlers = this.eventHandlers.get('message');
        if (handlers) {
            for (const handler of handlers) {
                try {
                    await handler(event);
                } catch (error) {
                    this.logger.error('Erro no handler de mensagem:', error);
                }
            }
        }
    }

    // Métodos públicos para registro de handlers
    onEvent(eventType: string, handler: SessionEventHandler): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }
        this.eventHandlers.get(eventType)?.add(handler);
    }

    offEvent(eventType: string, handler: SessionEventHandler): void {
        this.eventHandlers.get(eventType)?.delete(handler);
    }

    // Métodos de consulta
    getSession(instanceId: string): WhatsAppSession | undefined {
        return this.sessions.get(instanceId);
    }

    getAllSessions(): WhatsAppSession[] {
        return Array.from(this.sessions.values());
    }

    getActiveConnections(): number {
        return Array.from(this.sessions.values())
            .filter(s => s.status === WhatsAppInstanceStatus.CONNECTED)
            .length;
    }
}
