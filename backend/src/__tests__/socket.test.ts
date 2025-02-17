import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';
import { app } from '../app';
import { Message } from '../entities/message.entity';

describe('Socket.IO Server', () => {
    let io: Server;
    let clientSocket: any;
    let httpServer: any;

    beforeAll((done) => {
        httpServer = createServer(app);
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = (httpServer.address() as any).port;
            clientSocket = Client(`http://localhost:${port}`);
            clientSocket.on('connect', done);
        });
    });

    afterAll(() => {
        io.close();
        clientSocket.close();
        httpServer.close();
    });

    it('deve emitir evento de atualização da fila', (done) => {
        const mockQueueUpdate = {
            departmentId: '123',
            metrics: {
                queueLength: 5,
                activeChatsCount: 2,
                priorityDistribution: { high: 2, medium: 2, low: 1 }
            }
        };

        clientSocket.on('queue:updated', (data: any) => {
            expect(data).toEqual(mockQueueUpdate);
            done();
        });

        io.emit('queue:updated', mockQueueUpdate);
    });

    it('deve receber e processar mensagem do cliente', (done) => {
        const mockMessage: Partial<Message> = {
            content: 'Teste de mensagem',
            sender: 'user123',
            type: 'text'
        };

        io.on('message:send', (message: Message) => {
            expect(message).toEqual(mockMessage);
            done();
        });

        clientSocket.emit('message:send', mockMessage);
    });

    it('deve emitir erro quando necessário', (done) => {
        const mockError = { message: 'Erro de teste' };

        clientSocket.on('error', (error: any) => {
            expect(error).toEqual(mockError);
            done();
        });

        io.emit('error', mockError);
    });
});