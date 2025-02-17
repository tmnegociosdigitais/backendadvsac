import { Request, Response } from 'express';
import { WebhookEvent, Message } from '../types/evolution';
import departmentService from '../services/department.service';
import queueService from '../services/queue.service';
import { logger } from '../config/logger';

class WebhookController {
    async handleWebhook(req: Request, res: Response) {
        try {
            const event: WebhookEvent = req.body;

            // Log do evento recebido
            logger.info('Webhook recebido', {
                event: event.event,
                instance: event.instance
            });

            // Processa o evento baseado no tipo
            switch(event.event) {
                case 'messages.upsert':
                    await this.handleNewMessage(event.instance, event.data);
                    break;

                case 'connection.update':
                    await this.handleConnectionUpdate(event.instance, event.data);
                    break;

                case 'qr.update':
                    await this.handleQRUpdate(event.instance, event.data);
                    break;

                case 'messages.update':
                    await this.handleMessageUpdate(event.instance, event.data);
                    break;

                default:
                    logger.warn('Evento de webhook não tratado', {
                        event: event.event,
                        instance: event.instance
                    });
            }

            // Responde com sucesso
            return res.status(200).json({
                status: 'success',
                message: 'Webhook processado com sucesso'
            });

        } catch (error) {
            logger.error('Erro ao processar webhook', {
                error: error.message,
                body: req.body
            });

            return res.status(500).json({
                status: 'error',
                message: 'Erro ao processar webhook'
            });
        }
    }

    private async handleNewMessage(instance: string, data: any) {
        try {
            // Verifica se é uma mensagem válida e não é do sistema
            if (!this.isValidMessage(data)) {
                return;
            }

            const message: Message = this.formatMessage(data);

            // Processa a mensagem através do serviço de departamento
            await departmentService.handleIncomingMessage(instance, message);

            // Adiciona à fila se necessário
            const departmentId = await departmentService.getDepartmentByInstance(instance);
            if (departmentId) {
                await queueService.enqueue(message, departmentId);
            }

        } catch (error) {
            logger.error('Erro ao processar nova mensagem', {
                error: error.message,
                instance,
                messageData: data
            });
        }
    }

    private async handleConnectionUpdate(instance: string, data: any) {
        try {
            const status = data.status;
            await departmentService.updateInstanceStatus(instance, status);

            logger.info('Status da conexão atualizado', {
                instance,
                status
            });
        } catch (error) {
            logger.error('Erro ao atualizar status da conexão', {
                error: error.message,
                instance,
                status: data.status
            });
        }
    }

    private async handleQRUpdate(instance: string, data: any) {
        try {
            const qrCode = data.qrcode;
            await departmentService.updateInstanceQR(instance, qrCode);

            logger.info('QR Code atualizado', { instance });
        } catch (error) {
            logger.error('Erro ao atualizar QR Code', {
                error: error.message,
                instance
            });
        }
    }

    private async handleMessageUpdate(instance: string, data: any) {
        try {
            const messageUpdate = this.formatMessageUpdate(data);
            await departmentService.handleMessageUpdate(instance, messageUpdate);

            logger.info('Status da mensagem atualizado', {
                instance,
                messageId: messageUpdate.id,
                status: messageUpdate.status
            });
        } catch (error) {
            logger.error('Erro ao atualizar status da mensagem', {
                error: error.message,
                instance,
                messageData: data
            });
        }
    }

    private isValidMessage(data: any): boolean {
        return (
            data &&
            data.message &&
            !data.message.fromMe &&
            data.message.type !== 'notification'
        );
    }

    private formatMessage(data: any): Message {
        return {
            id: data.message.id,
            from: data.message.from,
            to: data.message.to,
            body: data.message.body,
            type: data.message.type,
            timestamp: data.message.timestamp,
            status: 'received'
        };
    }

    private formatMessageUpdate(data: any): Partial<Message> {
        return {
            id: data.id,
            status: data.status,
            timestamp: data.timestamp
        };
    }
}

export default new WebhookController();
