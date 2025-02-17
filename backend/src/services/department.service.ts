import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/department';
import { Department } from '../entities/department.entity';
import departmentRepository from '../repositories/department.repository';
import userRepository from '../repositories/user.repository';
import { UserRole } from '../types/auth';
import { logger } from '../config/logger';

class DepartmentService {
    async create(data: CreateDepartmentDTO, creatorId: string): Promise<Department> {
        try {
            // Verifica se o criador tem permissão (deve ser OWNER ou CONTRACTOR)
            const creator = await userRepository.findById(creatorId);
            if (!creator || (creator.role !== UserRole.ROLE_OWNER && creator.role !== UserRole.ROLE_CONTRACTOR)) {
                throw new Error('Sem permissão para criar departamento');
            }

            // Verifica se os supervisores existem
            const supervisors = await Promise.all(
                data.supervisors.map(id => userRepository.findById(id))
            );
            if (supervisors.some(s => !s)) {
                throw new Error('Um ou mais supervisores não encontrados');
            }

            // Verifica se os membros existem
            const members = await Promise.all(
                data.members.map(id => userRepository.findById(id))
            );
            if (members.some(m => !m)) {
                throw new Error('Um ou mais membros não encontrados');
            }

            const department = await departmentRepository.createDepartment(data);
            logger.info('Departamento criado com sucesso', { 
                departmentId: department.id,
                creatorId 
            });

            return department;
        } catch (error) {
            logger.error('Erro ao criar departamento', { 
                error: error.message,
                data,
                creatorId 
            });
            throw error;
        }
    }

    async update(id: string, data: UpdateDepartmentDTO, userId: string): Promise<Department> {
        try {
            const department = await departmentRepository.findWithRelations(id);
            if (!department) {
                throw new Error('Departamento não encontrado');
            }

            // Verifica permissão para atualizar
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const canUpdate = user.role === UserRole.ROLE_OWNER || 
                            user.role === UserRole.ROLE_CONTRACTOR ||
                            department.isSupervisor(userId);

            if (!canUpdate) {
                throw new Error('Sem permissão para atualizar departamento');
            }

            const updatedDepartment = await departmentRepository.updateDepartment(id, data);
            logger.info('Departamento atualizado com sucesso', { 
                departmentId: id,
                updaterId: userId 
            });

            return updatedDepartment;
        } catch (error) {
            logger.error('Erro ao atualizar departamento', { 
                error: error.message,
                departmentId: id,
                data,
                userId 
            });
            throw error;
        }
    }

    async delete(id: string, userId: string): Promise<void> {
        try {
            const department = await departmentRepository.findWithRelations(id);
            if (!department) {
                throw new Error('Departamento não encontrado');
            }

            // Apenas OWNER pode deletar departamentos
            const user = await userRepository.findById(userId);
            if (!user || user.role !== UserRole.ROLE_OWNER) {
                throw new Error('Sem permissão para deletar departamento');
            }

            await departmentRepository.softDelete(id);
            logger.info('Departamento deletado com sucesso', { 
                departmentId: id,
                deleterId: userId 
            });
        } catch (error) {
            logger.error('Erro ao deletar departamento', { 
                error: error.message,
                departmentId: id,
                userId 
            });
            throw error;
        }
    }

    async findById(id: string, userId: string): Promise<Department> {
        try {
            const department = await departmentRepository.findWithRelations(id);
            if (!department) {
                throw new Error('Departamento não encontrado');
            }

            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Verifica se o usuário tem acesso ao departamento
            const hasAccess = user.role === UserRole.ROLE_OWNER ||
                            user.role === UserRole.ROLE_CONTRACTOR ||
                            department.isSupervisor(userId) ||
                            department.isMember(userId);

            if (!hasAccess) {
                throw new Error('Sem permissão para visualizar este departamento');
            }

            return department;
        } catch (error) {
            logger.error('Erro ao buscar departamento', { 
                error: error.message,
                departmentId: id,
                userId 
            });
            throw error;
        }
    }

    async listByUser(userId: string): Promise<Department[]> {
        try {
            const user = await userRepository.findById(userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // OWNER e CONTRACTOR podem ver todos os departamentos
            if (user.role === UserRole.ROLE_OWNER || user.role === UserRole.ROLE_CONTRACTOR) {
                return departmentRepository.find({ where: { active: true } });
            }

            // Para outros usuários, retorna apenas os departamentos onde são membros ou supervisores
            const asSupervisor = await departmentRepository.findBySupervisor(userId);
            const asMember = await departmentRepository.findByMember(userId);

            // Remove duplicatas
            const departments = [...asSupervisor, ...asMember];
            const uniqueDepartments = departments.filter((dep, index) => {
                return departments.findIndex(d => d.id === dep.id) === index;
            });

            return uniqueDepartments.filter(dep => dep.active);
        } catch (error) {
            logger.error('Erro ao listar departamentos do usuário', { 
                error: error.message,
                userId 
            });
            throw error;
        }
    }
}

export default new DepartmentService();
