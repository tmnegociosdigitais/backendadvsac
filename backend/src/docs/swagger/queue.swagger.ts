import { ApiProperty } from '@nestjs/swagger';
import { QueuePriority, QueueStatus } from '../../types/queue.types';

export class AddToQueueDto {
    @ApiProperty({
        description: 'Mensagem a ser adicionada à fila',
        example: {
            content: 'Olá, preciso de ajuda',
            sender: 'user1',
            type: 'text'
        }
    })
    message: any;

    @ApiProperty({
        description: 'ID do departamento',
        example: 'dept1'
    })
    departmentId: string;

    @ApiProperty({
        description: 'Prioridade da mensagem na fila',
        enum: QueuePriority,
        example: QueuePriority.NORMAL
    })
    priority?: QueuePriority;
}

export class QueueItemResponseDto {
    @ApiProperty({
        description: 'ID único do item na fila',
        example: 'queue-123'
    })
    id: string;

    @ApiProperty({
        description: 'ID do ticket',
        example: 'T123'
    })
    ticketId: string;

    @ApiProperty({
        description: 'ID do departamento',
        example: 'dept1'
    })
    departmentId: string;

    @ApiProperty({
        description: 'Prioridade do item na fila',
        enum: QueuePriority,
        example: QueuePriority.NORMAL
    })
    priority: QueuePriority;

    @ApiProperty({
        description: 'Data de entrada na fila',
        example: '2025-02-10T04:30:00.000Z'
    })
    enteredAt: Date;

    @ApiProperty({
        description: 'Data da última atualização',
        example: '2025-02-10T04:30:00.000Z'
    })
    lastUpdate: Date;

    @ApiProperty({
        description: 'Status atual do item na fila',
        enum: QueueStatus,
        example: QueueStatus.WAITING
    })
    status: QueueStatus;

    @ApiProperty({
        description: 'ID do agente designado (se houver)',
        example: 'agent1',
        required: false
    })
    assignedTo?: string;

    @ApiProperty({
        description: 'Metadados do item na fila',
        example: {
            messageCount: 1,
            source: 'whatsapp',
            tags: ['novo_cliente']
        }
    })
    metadata: any;
}

export class QueueMetricsResponseDto {
    @ApiProperty({
        description: 'Total de itens na fila',
        example: 10
    })
    totalItems: number;

    @ApiProperty({
        description: 'Itens aguardando atendimento',
        example: 5
    })
    waitingItems: number;

    @ApiProperty({
        description: 'Itens em processamento',
        example: 3
    })
    processingItems: number;

    @ApiProperty({
        description: 'Itens atribuídos a agentes',
        example: 2
    })
    assignedItems: number;

    @ApiProperty({
        description: 'Tempo médio de espera (em segundos)',
        example: 120
    })
    averageWaitTime: number;

    @ApiProperty({
        description: 'Carga atual do sistema (%)',
        example: 75
    })
    currentLoad: number;
}

/**
 * @swagger
 * /api/queues:
 *   post:
 *     tags: [Queue]
 *     summary: Adiciona uma mensagem à fila
 *     description: Adiciona uma nova mensagem à fila de atendimento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToQueueDto'
 *     responses:
 *       200:
 *         description: Mensagem adicionada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueItemResponseDto'
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 * 
 *   get:
 *     tags: [Queue]
 *     summary: Lista itens da fila
 *     description: Retorna todos os itens da fila
 *     responses:
 *       200:
 *         description: Lista de itens da fila
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QueueItemResponseDto'
 * 
 * /api/queues/metrics:
 *   get:
 *     tags: [Queue]
 *     summary: Métricas da fila
 *     description: Retorna métricas atuais da fila
 *     responses:
 *       200:
 *         description: Métricas da fila
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueueMetricsResponseDto'
 */
