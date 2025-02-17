import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../config/database';
import { UserCreateDTO, UserUpdateDTO } from '../types/auth';
import { logger } from '../config/logger';

class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  /**
   * Cria um novo usuário
   */
  async create(userData: UserCreateDTO): Promise<User> {
    try {
      const user = this.repository.create(userData);
      await this.repository.save(user);
      logger.info('Usuário criado com sucesso', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Erro ao criar usuário', { error: error.message });
      throw error;
    }
  }

  /**
   * Busca um usuário por ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      return await this.repository.findOneBy({ id });
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID', { error: error.message });
      throw error;
    }
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.repository.findOneBy({ email });
    } catch (error) {
      logger.error('Erro ao buscar usuário por email', { error: error.message });
      throw error;
    }
  }

  /**
   * Atualiza um usuário
   */
  async update(id: string, updateData: UserUpdateDTO): Promise<User> {
    try {
      const user = await this.findById(id);
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      Object.assign(user, updateData);
      await this.repository.save(user);
      
      logger.info('Usuário atualizado com sucesso', { userId: id });
      return user;
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { error: error.message });
      throw error;
    }
  }

  /**
   * Lista todos os usuários
   */
  async findAll(): Promise<User[]> {
    try {
      return await this.repository.find();
    } catch (error) {
      logger.error('Erro ao listar usuários', { error: error.message });
      throw error;
    }
  }

  /**
   * Remove um usuário (soft delete - apenas marca como inativo)
   */
  async remove(id: string): Promise<void> {
    try {
      await this.update(id, { active: false });
      logger.info('Usuário removido com sucesso', { userId: id });
    } catch (error) {
      logger.error('Erro ao remover usuário', { error: error.message });
      throw error;
    }
  }
}

export default new UserRepository();
