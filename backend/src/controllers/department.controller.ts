import { Request, Response } from 'express';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/department';
import departmentService from '../services/department.service';
import { logger } from '../config/logger';

class DepartmentController {
    async create(req: Request, res: Response) {
        try {
            const data: CreateDepartmentDTO = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: 'Não autorizado',
                    message: 'Usuário não autenticado'
                });
            }

            // Validações básicas
            if (!data.name) {
                return res.status(400).json({
                    error: 'Dados inválidos',
                    message: 'Nome do departamento é obrigatório'
                });
            }

            const department = await departmentService.create(data, userId);
            return res.status(201).json(department);
        } catch (error) {
            logger.error('Erro ao criar departamento', { error: error.message });

            if (error.message === 'Sem permissão para criar departamento') {
                return res.status(403).json({
                    error: 'Acesso negado',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno',
                message: 'Erro ao criar departamento'
            });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data: UpdateDepartmentDTO = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: 'Não autorizado',
                    message: 'Usuário não autenticado'
                });
            }

            const department = await departmentService.update(id, data, userId);
            return res.json(department);
        } catch (error) {
            logger.error('Erro ao atualizar departamento', { error: error.message });

            if (error.message === 'Departamento não encontrado') {
                return res.status(404).json({
                    error: 'Não encontrado',
                    message: error.message
                });
            }

            if (error.message === 'Sem permissão para atualizar departamento') {
                return res.status(403).json({
                    error: 'Acesso negado',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno',
                message: 'Erro ao atualizar departamento'
            });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: 'Não autorizado',
                    message: 'Usuário não autenticado'
                });
            }

            await departmentService.delete(id, userId);
            return res.status(204).send();
        } catch (error) {
            logger.error('Erro ao deletar departamento', { error: error.message });

            if (error.message === 'Departamento não encontrado') {
                return res.status(404).json({
                    error: 'Não encontrado',
                    message: error.message
                });
            }

            if (error.message === 'Sem permissão para deletar departamento') {
                return res.status(403).json({
                    error: 'Acesso negado',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno',
                message: 'Erro ao deletar departamento'
            });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: 'Não autorizado',
                    message: 'Usuário não autenticado'
                });
            }

            const department = await departmentService.findById(id, userId);
            return res.json(department);
        } catch (error) {
            logger.error('Erro ao buscar departamento', { error: error.message });

            if (error.message === 'Departamento não encontrado') {
                return res.status(404).json({
                    error: 'Não encontrado',
                    message: error.message
                });
            }

            if (error.message === 'Sem permissão para visualizar este departamento') {
                return res.status(403).json({
                    error: 'Acesso negado',
                    message: error.message
                });
            }

            return res.status(500).json({
                error: 'Erro interno',
                message: 'Erro ao buscar departamento'
            });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    error: 'Não autorizado',
                    message: 'Usuário não autenticado'
                });
            }

            const departments = await departmentService.listByUser(userId);
            return res.json(departments);
        } catch (error) {
            logger.error('Erro ao listar departamentos', { error: error.message });

            return res.status(500).json({
                error: 'Erro interno',
                message: 'Erro ao listar departamentos'
            });
        }
    }
}

export default new DepartmentController();
