import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { verifyToken } from '../middlewares/auth';
import { ClientToServerEvents, IOServer, ServerToClientEvents, InterServerEvents, SocketData, WebhookEvent } from '../types/socket.types';
import { createAdapter } from '@socket.io/redis-adapter';
import { RedisClientType } from 'redis';
import { evolutionConfig } from './evolution.config';

export const configureSocket = (httpServer: HTTPServer, pubClient: RedisClientType, subClient: RedisClientType): IOServer => {
  const io: IOServer = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 10000,
    maxHttpBufferSize: 1e8 // 100 MB
  });

  // Configurar adaptador Redis
  io.adapter(createAdapter(pubClient, subClient));

  // Middleware de autenticação
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const user = await verifyToken(token);
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Namespace de atendimento
  const attendance = io.of('/attendance');
  attendance.on('connection', (socket) => {
    // Emite status inicial
    socket.emit('auth:success', {
      userId: socket.data.user.userId,
      role: socket.data.user.role,
      transport: socket.conn.transport.name
    });

    logger.info('Cliente conectado ao namespace de atendimentos', { 
      socketId: socket.id,
      userId: socket.data.user.userId,
      transport: socket.conn.transport.name
    });

    // Gerenciamento de salas
    socket.on('attendance:join', async (departmentId, callback) => {
      try {
        await socket.join(`department:${departmentId}`);
        socket.data.departmentId = departmentId;
        logger.info('Cliente entrou na sala do departamento', { 
          socketId: socket.id, 
          departmentId,
          userId: socket.data.user.userId
        });
        callback?.({ success: true });
      } catch (error) {
        logger.error('Erro ao entrar na sala do departamento', { 
          socketId: socket.id, 
          departmentId, 
          error 
        });
        callback?.({ success: false, error: 'Erro ao entrar na sala' });
      }
    });

    // Limpeza na desconexão
    socket.on('disconnect', async (reason) => {
      if (socket.data.departmentId) {
        await socket.leave(`department:${socket.data.departmentId}`);
      }
      logger.info('Cliente desconectado do namespace de atendimentos', { 
        socketId: socket.id,
        userId: socket.data.user.userId,
        reason
      });
    });

    // Tratamento de erros
    socket.on('error', (error) => {
      logger.error('Erro no socket de atendimento', { 
        socketId: socket.id,
        userId: socket.data.user.userId,
        error 
      });
    });
  });

  // Namespace de dashboard
  const dashboard = io.of('/dashboard');
  dashboard.on('connection', (socket) => {
    logger.info('Cliente conectado ao namespace do dashboard', { 
      socketId: socket.id,
      userId: socket.data.user.userId
    });

    socket.on('dashboard:subscribe', async (callback) => {
      try {
        await socket.join('dashboard-updates');
        logger.info('Cliente inscrito nas atualizações do dashboard', { 
          socketId: socket.id,
          userId: socket.data.user.userId
        });
        callback?.({ success: true });
      } catch (error) {
        logger.error('Erro ao inscrever no dashboard', { 
          socketId: socket.id, 
          error 
        });
        callback?.({ success: false, error: 'Erro ao inscrever no dashboard' });
      }
    });

    socket.on('disconnect', async (reason) => {
      await socket.leave('dashboard-updates');
      logger.info('Cliente desconectado do namespace do dashboard', { 
        socketId: socket.id,
        userId: socket.data.user.userId,
        reason
      });
    });
  });

  // Namespace de fila
  const queue = io.of('/queue');
  queue.on('connection', (socket) => {
    logger.info('Cliente conectado ao namespace de filas', { 
      socketId: socket.id,
      userId: socket.data.user.userId
    });

    socket.on('queue:join', async (departmentId, callback) => {
      try {
        await socket.join(`queue:${departmentId}`);
        socket.data.departmentId = departmentId;
        logger.info('Cliente entrou na fila do departamento', { 
          socketId: socket.id,
          departmentId,
          userId: socket.data.user.userId
        });
        callback?.({ success: true });
      } catch (error) {
        logger.error('Erro ao entrar na fila', { 
          socketId: socket.id, 
          departmentId, 
          error 
        });
        callback?.({ success: false, error: 'Erro ao entrar na fila' });
      }
    });

    socket.on('disconnect', async (reason) => {
      if (socket.data.departmentId) {
        await socket.leave(`queue:${socket.data.departmentId}`);
      }
      logger.info('Cliente desconectado do namespace de filas', { 
        socketId: socket.id,
        userId: socket.data.user.userId,
        reason
      });
    });
  });

  // Namespace da Evolution API
  const evolution = io.of('/evolution');
  evolution.on('connection', (socket) => {
    // QR Code
    socket.on('evolution:qr-code', async (instanceId) => {
      try {
        const qrCode = await evolutionConfig.getQRCode(instanceId);
        socket.emit('evolution:qr-code-received', {
          instanceId,
          qrcode: qrCode
        });
      } catch (error) {
        socket.emit('evolution:error', { error: 'Failed to get QR code' });
      }
    });

    // Status da conexão
    socket.on('evolution:status', async (instanceId) => {
      try {
        const status = await evolutionConfig.getConnectionStatus(instanceId);
        socket.emit('evolution:status-update', {
          instanceId,
          status
        });
      } catch (error) {
        socket.emit('evolution:error', { error: 'Failed to get status' });
      }
    });

    // Status de mensagem
    socket.on('evolution:message-status', async (data) => {
      try {
        const status = await evolutionConfig.getMessageStatus(data.messageId);
        socket.emit('evolution:message-status-update', {
          messageId: data.messageId,
          status
        });
      } catch (error) {
        socket.emit('evolution:error', { error: 'Failed to get message status' });
      }
    });

    // Eventos de webhook
    socket.on('evolution:webhook-event', (data: WebhookEvent) => {
      // Processar evento do webhook
      evolution.emit('evolution:webhook-received', data);
    });

    // Desconexão
    socket.on('disconnect', () => {
      // Limpeza necessária
    });
  });

  // Configurar rate limiting
  const rateLimiter = {
    points: 100, // Número de requisições
    duration: 60, // Por minuto
    clients: new Map()
  };

  io.use((socket, next) => {
    const clientId = socket.handshake.address;
    const now = Date.now();
    const client = rateLimiter.clients.get(clientId) || { points: rateLimiter.points, lastReset: now };

    if (now - client.lastReset > rateLimiter.duration * 1000) {
      client.points = rateLimiter.points;
      client.lastReset = now;
    }

    if (client.points > 0) {
      client.points--;
      rateLimiter.clients.set(clientId, client);
      next();
    } else {
      next(new Error('Rate limit exceeded'));
    }
  });

  // Configurar compressão
  io.use((socket, next) => {
    socket.conn.on('packet', (packet) => {
      if (packet.type === 'binary') {
        // Implementar lógica de compressão se necessário
      }
    });
    next();
  });

  // Heartbeat
  setInterval(() => {
    io.sockets.emit('ping');
  }, 25000);

  return io;
};
