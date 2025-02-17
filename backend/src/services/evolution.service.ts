import { Injectable } from '@nestjs/common';
import { Message, WebhookEvent, Instance, EvolutionConfig } from '../types/evolution';
import { SocketService } from './socket.service';
import { LoggerService } from './logger.service';
import { AppError } from '../utils/errors';

@Injectable()
export class EvolutionService {
    private instances: Map<string, Instance> = new Map();
    private messageHandlers: Map<string, (data: any) => void> = new Map();

    constructor(
        private socketService: SocketService,
        private loggerService: LoggerService
    ) {
        this.setupSocketListeners();
    }

    private setupSocketListeners(): void {
        this.socketService.server.on('connection', (socket) => {
            this.loggerService.info('Nova conexão Socket.IO estabelecida');

            // Eventos de mensagem
            socket.on('message:send', this.handleSendMessage.bind(this));
            socket.on('message:status', this.handleMessageStatus.bind(this));

            // Eventos de instância
            socket.on('instance:connect', this.handleInstanceConnect.bind(this));
            socket.on('instance:disconnect', this.handleInstanceDisconnect.bind(this));
            socket.on('instance:status', this.handleInstanceStatus.bind(this));

            // Eventos de webhook
            socket.on('webhook:event', this.handleWebhookEvent.bind(this));

            socket.on('disconnect', () => {
                this.loggerService.info('Conexão Socket.IO encerrada');
            });
        });
    }

    async sendMessage(message: Message): Promise<void> {
        try {
            const instance = await this.getInstanceByNumber(message.to);
            if (!instance) {
                throw new AppError('Instância não encontrada', 404);
            }

            const messageId = `msg_${Date.now()}`;

            this.messageHandlers.set(messageId, (data) => {
                if (data.status === 'sent') {
                    this.socketService.server.emit('message:sent', {
                        messageId: message.id,
                        instanceId: instance.id,
                        status: 'sent'
                    });
                } else {
                    throw new AppError('Erro ao enviar mensagem', 500);
                }
            });

            this.socketService.server.emit('message:send', {
                messageId,
                instanceId: instance.id,
                to: message.from,
                content: message.content
            });

            setTimeout(() => {
                if (this.messageHandlers.has(messageId)) {
                    this.messageHandlers.delete(messageId);
                    throw new AppError('Timeout ao enviar mensagem', 408);
                }
            }, 10000);
        } catch (error) {
            this.loggerService.error('Erro ao enviar mensagem:', error);
            throw new AppError('Erro ao enviar mensagem', 500);
        }
    }

    async assignChat(params: { ticketId: string; agentId: string; departmentId: string }): Promise<void> {
        try {
            const { ticketId, agentId, departmentId } = params;
            
            this.socketService.server.emit('chat:assign', {
                ticketId,
                agentId,
                departmentId,
                timestamp: new Date()
            });

            // Aguarda confirmação da Evolution API
            await new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new AppError('Timeout ao atribuir chat', 408));
                }, 10000);

                this.socketService.server.once('chat:assigned', (data) => {
                    if (data.ticketId === ticketId) {
                        clearTimeout(timeoutId);
                        resolve(data);
                    }
                });
            });
        } catch (error) {
            this.loggerService.error('Erro ao atribuir chat:', error);
            throw new AppError('Erro ao atribuir chat', 500);
        }
    }

    private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
        try {
            switch (event.type) {
                case 'message':
                    await this.handleMessageEvent(event);
                    break;
                case 'status':
                    await this.handleStatusEvent(event);
                    break;
                case 'connection':
                    await this.handleConnectionEvent(event);
                    break;
                default:
                    this.loggerService.warn('Evento de webhook não reconhecido', { event });
            }
        } catch (error) {
            this.loggerService.error('Erro ao processar webhook:', error);
            throw new AppError('Erro ao processar webhook', 500);
        }
    }

    private async handleMessageEvent(event: WebhookEvent): Promise<void> {
        const { data } = event;
        this.socketService.server.emit('message:received', {
            messageId: data.id,
            instanceId: event.instance,
            from: data.from,
            content: data.content,
            timestamp: event.timestamp
        });
    }

    private async handleStatusEvent(event: WebhookEvent): Promise<void> {
        const { data } = event;
        this.socketService.server.emit('message:status', {
            messageId: data.messageId,
            instanceId: event.instance,
            status: data.status,
            timestamp: event.timestamp
        });
    }

    private async handleConnectionEvent(event: WebhookEvent): Promise<void> {
        const { data } = event;
        const instance = this.instances.get(event.instance);
        if (instance) {
            instance.status = data.status;
            this.instances.set(event.instance, instance);
            this.socketService.server.emit('instance:status', {
                instanceId: event.instance,
                status: data.status,
                timestamp: event.timestamp
            });
        }
    }

    private async getInstanceByNumber(number: string): Promise<Instance | null> {
        // Procura a instância na memória
        for (const instance of this.instances.values()) {
            if (instance.status === 'connected') {
                return instance;
            }
        }
        return null;
    }

    private async handleSendMessage(data: any): Promise<void> {
        const handler = this.messageHandlers.get(data.messageId);
        if (handler) {
            handler(data);
            this.messageHandlers.delete(data.messageId);
        }
    }

    private async handleMessageStatus(data: any): Promise<void> {
        this.socketService.server.emit('message:status', {
            messageId: data.messageId,
            instanceId: data.instanceId,
            status: data.status,
            timestamp: new Date()
        });
    }

    private async handleInstanceConnect(data: any): Promise<void> {
        const instance: Instance = {
            id: data.instanceId,
            name: data.name,
            status: 'connecting'
        };
        this.instances.set(instance.id, instance);
        this.socketService.server.emit('instance:connecting', instance);
    }

    private async handleInstanceDisconnect(data: any): Promise<void> {
        const instance = this.instances.get(data.instanceId);
        if (instance) {
            instance.status = 'disconnected';
            this.instances.set(instance.id, instance);
            this.socketService.server.emit('instance:disconnected', instance);
        }
    }

    private async handleInstanceStatus(data: any): Promise<void> {
        const instance = this.instances.get(data.instanceId);
        if (instance) {
            instance.status = data.status;
            this.instances.set(instance.id, instance);
            this.socketService.server.emit('instance:status', instance);
        }
    }
}
