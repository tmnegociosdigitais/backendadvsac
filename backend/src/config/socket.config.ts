import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../middlewares/auth.middleware';

export class SocketServer {
  private io: Server;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    // Middleware de autenticação
    this.io.use(async (socket, next) => {
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

    this.setupNamespaces();
  }

  private setupNamespaces() {
    // Namespace para o dashboard
    const dashboard = this.io.of('/dashboard');
    dashboard.on('connection', (socket) => {
      console.log('Cliente conectado ao dashboard');
      
      socket.on('disconnect', () => {
        console.log('Cliente desconectado do dashboard');
      });
    });

    // Namespace para atendimentos
    const atendimentos = this.io.of('/atendimentos');
    atendimentos.on('connection', (socket) => {
      console.log('Cliente conectado aos atendimentos');
      
      socket.on('disconnect', () => {
        console.log('Cliente desconectado dos atendimentos');
      });
    });

    // Namespace para o CRM
    const crm = this.io.of('/crm');
    crm.on('connection', (socket) => {
      console.log('Cliente conectado ao CRM');
      
      socket.on('disconnect', () => {
        console.log('Cliente desconectado do CRM');
      });
    });
  }

  // Método para emitir eventos para um namespace específico
  public emit(namespace: string, event: string, data: any) {
    this.io.of(namespace).emit(event, data);
  }

  // Método para emitir eventos para uma sala específica
  public emitToRoom(namespace: string, room: string, event: string, data: any) {
    this.io.of(namespace).to(room).emit(event, data);
  }
}
