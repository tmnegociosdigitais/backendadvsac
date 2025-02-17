import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({
        description: 'ID do destinatário',
        example: '5511999999999'
    })
    to: string;

    @ApiProperty({
        description: 'Conteúdo da mensagem',
        example: 'Olá, como posso ajudar?'
    })
    content: string;

    @ApiProperty({
        description: 'Tipo da mensagem',
        example: 'text',
        enum: ['text', 'image', 'video', 'audio', 'document']
    })
    type: string;
}

export class AssignChatDto {
    @ApiProperty({
        description: 'ID do ticket',
        example: 'T123'
    })
    ticketId: string;

    @ApiProperty({
        description: 'ID do agente',
        example: 'agent1'
    })
    agentId: string;

    @ApiProperty({
        description: 'ID do departamento',
        example: 'dept1'
    })
    departmentId: string;
}

export class WebhookEventDto {
    @ApiProperty({
        description: 'Tipo do evento',
        example: 'message',
        enum: ['message', 'status', 'connection']
    })
    type: string;

    @ApiProperty({
        description: 'ID da instância',
        example: 'instance1'
    })
    instance: string;

    @ApiProperty({
        description: 'Timestamp do evento',
        example: '2025-02-10T04:30:00.000Z'
    })
    timestamp: Date;

    @ApiProperty({
        description: 'Dados do evento',
        example: {
            messageId: '123',
            status: 'delivered'
        }
    })
    data: any;
}

/**
 * @swagger
 * /api/evolution/messages:
 *   post:
 *     tags: [Evolution]
 *     summary: Envia uma mensagem
 *     description: Envia uma mensagem através da Evolution API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageDto'
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 * 
 * /api/evolution/chats/assign:
 *   post:
 *     tags: [Evolution]
 *     summary: Atribui um chat
 *     description: Atribui um chat a um agente específico
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignChatDto'
 *     responses:
 *       200:
 *         description: Chat atribuído com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 * 
 * /webhook/evolution:
 *   post:
 *     tags: [Evolution]
 *     summary: Webhook da Evolution API
 *     description: Endpoint para receber eventos da Evolution API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WebhookEventDto'
 *     responses:
 *       200:
 *         description: Evento processado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
