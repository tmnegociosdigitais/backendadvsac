import { Router } from 'express';
import queueController from '../controllers/queue.controller';
import { validateBody } from '../middlewares/validation';
import { EnqueueMessageDto, UpdatePriorityDto } from '../dtos/queue.dto';

const router = Router();

/**
 * @swagger
 * /queue/enqueue:
 *   post:
 *     summary: Adiciona uma mensagem à fila
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnqueueMessageDto'
 */
router.post('/enqueue', validateBody(EnqueueMessageDto), queueController.enqueue);

/**
 * @swagger
 * /queue/update-priority:
 *   post:
 *     summary: Atualiza a prioridade de uma mensagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePriorityDto'
 */
router.post('/update-priority', validateBody(UpdatePriorityDto), queueController.updatePriority);

/**
 * @swagger
 * /queue/metrics/{departmentId}:
 *   get:
 *     summary: Obtém métricas da fila de um departamento
 *     parameters:
 *       - name: departmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/metrics/:departmentId', queueController.getMetrics);

export default router;
