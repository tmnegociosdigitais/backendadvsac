import { DashboardMetrics } from '../types/evolution';
import queueService from './queue.service';
import evolutionService from './evolution.service';
import { logger } from '../config/logger';
import { Server } from 'socket.io';

class MetricsService {
    private io: Server | null = null;

    /**
     * Configura a instância do Socket.IO
     */
    setSocketIO(io: Server) {
        this.io = io;
        logger.info('Socket.IO configurado no MetricsService');
    }

    /**
     * Obtém métricas atualizadas para o dashboard
     */
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        try {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));

            const metrics = {
                atendimentosAtivos: await queueService.getActiveChats('all'),
                mensagensHoje: await evolutionService.getMessageCount(startOfDay, now),
                tempoMedioEspera: await queueService.getAverageWaitTime('all'),
                atendentesOnline: await evolutionService.getOnlineAgentsCount()
            };

            logger.debug('Métricas do dashboard obtidas', metrics);
            return metrics;
        } catch (error) {
            logger.error('Erro ao obter métricas do dashboard', error);
            throw error;
        }
    }

    /**
     * Atualiza métricas do dashboard via WebSocket
     */
    async updateDashboardMetrics(): Promise<void> {
        try {
            if (!this.io) {
                logger.warn('Socket.IO não configurado no MetricsService');
                return;
            }

            const metrics = await this.getDashboardMetrics();
            this.io.to('dashboard').emit('dashboard:metrics', metrics);
            logger.debug('Métricas do dashboard atualizadas via WebSocket');
        } catch (error) {
            logger.error('Erro ao atualizar métricas do dashboard', error);
        }
    }

    /**
     * Agenda atualização periódica das métricas
     * @param interval Intervalo em milissegundos (padrão: 30 segundos)
     */
    startPeriodicUpdates(interval: number = 30000): void {
        if (!this.io) {
            logger.warn('Socket.IO não configurado para atualizações periódicas');
            return;
        }

        setInterval(() => {
            this.updateDashboardMetrics();
        }, interval);

        logger.info('Atualizações periódicas de métricas iniciadas', { interval });
    }
}

export default new MetricsService();
