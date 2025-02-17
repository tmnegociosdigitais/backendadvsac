import { EntityRepository, Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
import { CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/department';
import { logger } from '../config/logger';

@EntityRepository(Department)
class DepartmentRepository extends Repository<Department> {
    async findWithRelations(id: string): Promise<Department | null> {
        try {
            return await this.findOne({
                where: { id },
                relations: ['supervisors', 'members', 'whatsappInstance']
            });
        } catch (error) {
            logger.error('Erro ao buscar departamento com relações', { 
                error: error.message,
                departmentId: id 
            });
            throw error;
        }
    }

    async findByMember(userId: string): Promise<Department[]> {
        try {
            return await this.createQueryBuilder('department')
                .leftJoinAndSelect('department.members', 'member')
                .where('member.id = :userId', { userId })
                .getMany();
        } catch (error) {
            logger.error('Erro ao buscar departamentos por membro', { 
                error: error.message,
                userId 
            });
            throw error;
        }
    }

    async findBySupervisor(userId: string): Promise<Department[]> {
        try {
            return await this.createQueryBuilder('department')
                .leftJoinAndSelect('department.supervisors', 'supervisor')
                .where('supervisor.id = :userId', { userId })
                .getMany();
        } catch (error) {
            logger.error('Erro ao buscar departamentos por supervisor', { 
                error: error.message,
                userId 
            });
            throw error;
        }
    }

    async createDepartment(data: CreateDepartmentDTO): Promise<Department> {
        try {
            const department = this.create(data);
            await this.save(department);
            logger.info('Departamento criado com sucesso', { departmentId: department.id });
            return department;
        } catch (error) {
            logger.error('Erro ao criar departamento', { 
                error: error.message,
                data 
            });
            throw error;
        }
    }

    async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<Department> {
        try {
            await this.update(id, data);
            const department = await this.findWithRelations(id);
            if (!department) {
                throw new Error('Departamento não encontrado após atualização');
            }
            logger.info('Departamento atualizado com sucesso', { departmentId: id });
            return department;
        } catch (error) {
            logger.error('Erro ao atualizar departamento', { 
                error: error.message,
                departmentId: id,
                data 
            });
            throw error;
        }
    }

    async softDelete(id: string): Promise<void> {
        try {
            await this.update(id, { active: false });
            logger.info('Departamento desativado com sucesso', { departmentId: id });
        } catch (error) {
            logger.error('Erro ao desativar departamento', { 
                error: error.message,
                departmentId: id 
            });
            throw error;
        }
    }
}

export default new DepartmentRepository();
