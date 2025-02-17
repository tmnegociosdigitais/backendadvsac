import { Request, Response } from 'express';
import { UserCreateDTO, UserUpdateDTO, UserRole } from '../types/auth';
import authService from '../services/auth.service';
import { logger } from '../config/logger';

class AuthController {
  /**
   * Registra um novo usuário
   */
  async register(req: Request, res: Response) {
    try {
      const userData: UserCreateDTO = req.body;

      // Validações básicas
      if (!userData.email || !userData.password || !userData.name || !userData.role) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          message: 'Email, senha, nome e função são obrigatórios'
        });
      }

      // Apenas ROLE_OWNER pode criar outros ROLE_OWNER
      if (userData.role === UserRole.ROLE_OWNER && req.user?.role !== UserRole.ROLE_OWNER) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas proprietários podem criar outros proprietários'
        });
      }

      const user = await authService.createUser(userData);
      return res.status(201).json(user);
    } catch (error) {
      logger.error('Erro ao registrar usuário', { error: error.message });
      
      if (error.message === 'Email já está em uso') {
        return res.status(409).json({ 
          error: 'Conflito',
          message: error.message 
        });
      }

      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Autentica um usuário
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          message: 'Email e senha são obrigatórios'
        });
      }

      const authResponse = await authService.login(email, password);
      return res.json(authResponse);
    } catch (error) {
      logger.error('Erro no login', { error: error.message });

      if (error.message === 'Credenciais inválidas' || error.message === 'Usuário inativo') {
        return res.status(401).json({ 
          error: 'Não autorizado',
          message: error.message 
        });
      }

      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const updateData: UserUpdateDTO = req.body;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          message: 'Nenhum dado fornecido para atualização'
        });
      }

      // Apenas ROLE_OWNER pode alterar roles
      if (updateData.role && req.user?.role !== UserRole.ROLE_OWNER) {
        return res.status(403).json({
          error: 'Acesso negado',
          message: 'Apenas proprietários podem alterar funções de usuários'
        });
      }

      const updatedUser = await authService.updateUser(userId, updateData);
      return res.json(updatedUser);
    } catch (error) {
      logger.error('Erro ao atualizar usuário', { error: error.message });

      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ 
          error: 'Não encontrado',
          message: error.message 
        });
      }

      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Lista todos os usuários
   */
  async listUsers(req: Request, res: Response) {
    try {
      const users = await authService.listUsers();
      return res.json(users);
    } catch (error) {
      logger.error('Erro ao listar usuários', { error: error.message });
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Obtém detalhes de um usuário específico
   */
  async getUserDetails(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ 
          error: 'Não encontrado',
          message: 'Usuário não encontrado'
        });
      }

      return res.json(user);
    } catch (error) {
      logger.error('Erro ao obter detalhes do usuário', { error: error.message });
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Desativa um usuário
   */
  async deactivateUser(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      await authService.updateUser(userId, { active: false });
      return res.status(204).send();
    } catch (error) {
      logger.error('Erro ao desativar usuário', { error: error.message });

      if (error.message === 'Usuário não encontrado') {
        return res.status(404).json({ 
          error: 'Não encontrado',
          message: error.message 
        });
      }

      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Obtém o perfil do usuário logado
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ 
          error: 'Não autorizado',
          message: 'Usuário não autenticado'
        });
      }

      const user = await authService.getUserById(req.user.userId);
      return res.json(user);
    } catch (error) {
      logger.error('Erro ao obter perfil', { error: error.message });
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }

  /**
   * Atualiza o token de acesso
   */
  async refreshToken(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ 
          error: 'Não autorizado',
          message: 'Usuário não autenticado'
        });
      }

      const token = await authService.generateNewToken(req.user.userId);
      return res.json({ token });
    } catch (error) {
      logger.error('Erro ao atualizar token', { error: error.message });
      return res.status(500).json({ 
        error: 'Erro interno',
        message: 'Erro ao processar a requisição'
      });
    }
  }
}

export default new AuthController();
