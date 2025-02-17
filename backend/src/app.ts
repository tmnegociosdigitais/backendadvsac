import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { initializeSocket } from './config/socket';
import { initializeDatabase } from './config/database.config';
import { logger, requestLogger, errorLogger } from './config/logger';
import env from './config/env';
import authRoutes from './routes/auth.routes';
import queueRoutes from './routes/queue.routes';
import messageRoutes from './routes/message.routes';
import clientRoutes from './routes/client.routes';
import { errorHandler } from './middlewares/error.handler';
import whatsappRoutes from './routes/whatsapp.routes';
import webhookRoutes from './routes/webhook.routes';
import metricsService from './services/metrics.service';
import dotenv from 'dotenv';

/**
 * Configuração principal da aplicação Express
 * Inicializa middlewares, banco de dados e rotas
 */

// Configuração das variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();

// Inicializa o banco de dados
if (process.env.NODE_ENV !== 'test') {
    initializeDatabase().catch(error => {
        logger.error('Falha ao inicializar o banco de dados:', error);
        process.exit(1);
    });
}

// Configurações básicas
app.use(cors({
    origin: env.app.cors.origin,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api', (req, res) => {
    res.json({ message: 'ADVSac API - Bem-vindo!' });
});

// Middleware de erro
app.use(errorLogger);
app.use(errorHandler);

// Inicializa o Socket.IO e obtém o servidor HTTP
const server = initializeSocket(app);

// Inicia os serviços apenas em ambiente não-teste
if (process.env.NODE_ENV !== 'test') {
    // Inicia atualizações periódicas de métricas
    metricsService.startPeriodicUpdates();
}

// Inicia o servidor
const PORT = env.app.port || 3000;
server.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
});

export { app, server };
