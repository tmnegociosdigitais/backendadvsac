import { Server } from 'socket.io';
import { logger } from '../config/logger';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData } from '../types/socket.types';

/**
 * Serviço para gerenciar conexões WebSocket e eventos em tempo real
 */
export class SocketService {
    private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

    /**
     * Construtor do serviço de Socket.IO
     * @param io Instância do servidor Socket.IO
     */
    constructor(io: Server) {
        this.io = io;
        this.setupEventHandlers();
        logger.info('Socket.IO inicializado');
    }

    /**
     * Configura handlers para eventos do Socket.IO
     */
    private setupEventHandlers(): void {
        this.io.on('connection', (socket) => {
            logger.info('Nova conexão WebSocket estabelecida', { socketId: socket.id });

            // Desconexão
            socket.on('disconnect', () => {
                logger.info('Cliente desconectado do Socket.IO', { socketId: socket.id });
            });

            // Atualização da fila
            socket.on('queue:update', (departmentId) => {
                // Implementar lógica de atualização da fila
                logger.info('Solicitação de atualização da fila recebida', { departmentId });
            });

            // Envio de mensagem
            socket.on('message:send', (message) => {
                // Implementar lógica de envio de mensagem
                logger.info('Nova mensagem recebida', { messageId: message.id });
            });
        });
    }

    /**
     * Notifica sobre atualizações nas filas de atendimento
     */
    public emitQueueUpdate(departmentId: string, metrics: any): void {
        this.io.emit('queue:updated', { departmentId, metrics });
        logger.debug('Atualização de fila enviada', { departmentId, metrics });
    }

    /**
     * Notifica sobre processamento de fila
     */
    public emitQueueProcessed(data: { departmentId: string; messageId: string; success: boolean; error?: string }): void {
        this.io.emit('queue:processed', data);
        logger.debug('Processamento de fila notificado', { departmentId: data.departmentId, messageId: data.messageId });
    }

    /**
     * Notifica sobre recebimento de mensagem
     */
    public emitMessageReceived(message: any): void {
        this.io.emit('message:received', message);
        logger.debug('Mensagem recebida notificada', { messageId: message.id });
    }

    /**
     * Notifica sobre envio de mensagem
     */
    public emitMessageSent(message: any): void {
        this.io.emit('message:sent', message);
        logger.debug('Mensagem enviada notificada', { messageId: message.id });
    }

    /**
     * Notifica sobre erro
     */
    public emitError(error: { message: string }): void {
        this.io.emit('error', error);
        logger.error('Erro notificado', { errorMessage: error.message });
    }
}

export default SocketService;
