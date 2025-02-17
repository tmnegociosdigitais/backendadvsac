import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { logger } from '../config/logger';
import env from '../config/env';
import { 
    ServerToClientEvents, 
    ClientToServerEvents, 
    InterServerEvents, 
    SocketData 
} from '../types/socket.types';

/**
 * Middleware de autenticação para conexões Socket.IO
 * Valida o token JWT e adiciona dados do usuário ao socket
 */
export async function authenticateSocket(
    socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
    next: (err?: Error) => void
) {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];

        if (!token) {
            throw new Error('Token de autenticação não fornecido');
        }

        // Remove o prefixo 'Bearer ' se presente
        const tokenString = token.replace('Bearer ', '');

        // Verifica o token JWT
        const decoded = verify(tokenString, env.jwt.secret) as any;

        // Adiciona dados do usuário ao socket
        socket.data.userId = decoded.sub;
        socket.data.role = decoded.role;

        logger.info('Socket autenticado com sucesso', {
            socketId: socket.id,
            userId: decoded.sub,
            role: decoded.role
        });

        next();
    } catch (error) {
        logger.error('Erro na autenticação do socket', {
            socketId: socket.id,
            error: error.message
        });
        next(new Error('Não autorizado'));
    }
}
