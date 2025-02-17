import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { AuthTokens, LoginDto, RegisterDto, UserCreateDTO, UserUpdateDTO } from '../types/auth';
import { logger } from '../config/logger';
import { AppError } from '../utils/errors';

/**
 * Serviço responsável pela autenticação e autorização de usuários
 * Implementa funcionalidades de registro, login, validação de tokens e gerenciamento de usuários
 * Utiliza JWT para tokens e bcrypt para hash de senhas
 */
class AuthService {
    constructor(private userRepository: UserRepository) {}

    /**
     * Registra um novo usuário no sistema
     * @param data Dados do usuário a ser registrado
     * @throws AppError se o email já estiver em uso
     */
    async register(data: RegisterDto): Promise<User> {
        logger.info('Iniciando registro de novo usuário', { email: data.email });
        
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            logger.warn('Tentativa de registro com email já existente', { email: data.email });
            throw new AppError('Email já está em uso', 400);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword
        });

        logger.info('Usuário registrado com sucesso', { userId: user.id, role: user.role });
        return user;
    }

    /**
     * Autentica um usuário
     * @param data Credenciais do usuário
     * @throws AppError se as credenciais forem inválidas
     */
    async login(data: LoginDto): Promise<AuthTokens> {
        logger.info('Tentativa de login', { email: data.email });

        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            logger.warn('Tentativa de login com email não cadastrado', { email: data.email });
            throw new AppError('Credenciais inválidas', 401);
        }

        if (!user.active) {
            logger.warn('Tentativa de login com usuário inativo', { userId: user.id });
            throw new AppError('Usuário inativo', 401);
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) {
            logger.warn('Tentativa de login com senha incorreta', { userId: user.id });
            throw new AppError('Credenciais inválidas', 401);
        }

        const tokens = this.generateTokens(user);
        logger.info('Login realizado com sucesso', { userId: user.id });
        return tokens;
    }

    /**
     * Atualiza o token de acesso usando um refresh token
     * @param refreshToken Token de atualização
     * @throws AppError se o token for inválido
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            logger.info('Tentativa de atualização de token');
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
            const user = await this.userRepository.findById(decoded.userId);

            if (!user) {
                logger.warn('Tentativa de refresh token com usuário inexistente', { userId: decoded.userId });
                throw new AppError('Usuário não encontrado', 404);
            }

            const tokens = this.generateTokens(user);
            logger.info('Token atualizado com sucesso', { userId: user.id });
            return tokens;
        } catch (error) {
            logger.error('Erro ao atualizar token', { error: error.message });
            throw new AppError('Token de atualização inválido', 401);
        }
    }

    /**
     * Lista todos os usuários
     * @returns Lista de usuários sem as senhas
     */
    async listUsers(): Promise<Omit<User, 'password'>[]> {
        try {
            logger.info('Listando todos os usuários');
            const users = await this.userRepository.findAll();
            return users.map(user => this.sanitizeUser(user));
        } catch (error) {
            logger.error('Erro ao listar usuários', { error: error.message });
            throw new AppError('Erro ao listar usuários', 500);
        }
    }

    /**
     * Busca um usuário pelo ID
     * @param userId ID do usuário
     * @returns Usuário encontrado ou null
     */
    async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
        try {
            logger.info('Buscando usuário por ID', { userId });
            const user = await this.userRepository.findById(userId);
            return user ? this.sanitizeUser(user) : null;
        } catch (error) {
            logger.error('Erro ao buscar usuário por ID', { error: error.message, userId });
            throw new AppError('Erro ao buscar usuário', 500);
        }
    }

    /**
     * Atualiza um usuário
     * @param userId ID do usuário
     * @param updateData Dados a serem atualizados
     */
    async updateUser(userId: string, updateData: UserUpdateDTO): Promise<Omit<User, 'password'>> {
        try {
            logger.info('Atualizando usuário', { userId, updateFields: Object.keys(updateData) });
            const user = await this.userRepository.update(userId, updateData);
            logger.info('Usuário atualizado com sucesso', { userId });
            return this.sanitizeUser(user);
        } catch (error) {
            logger.error('Erro ao atualizar usuário', { error: error.message, userId });
            throw new AppError('Erro ao atualizar usuário', 500);
        }
    }

    /**
     * Altera a senha de um usuário
     * @param userId ID do usuário
     * @param oldPassword Senha atual
     * @param newPassword Nova senha
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
        try {
            logger.info('Iniciando processo de alteração de senha', { userId });
            const user = await this.userRepository.findById(userId);
            if (!user) {
                logger.warn('Tentativa de alterar senha de usuário inexistente', { userId });
                throw new AppError('Usuário não encontrado', 404);
            }

            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
            if (!isPasswordValid) {
                logger.warn('Tentativa de alterar senha com senha atual incorreta', { userId });
                throw new AppError('Senha atual incorreta', 401);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await this.userRepository.update(userId, { password: hashedPassword });
            logger.info('Senha alterada com sucesso', { userId });
        } catch (error) {
            logger.error('Erro ao alterar senha', { error: error.message, userId });
            throw error instanceof AppError ? error : new AppError('Erro ao alterar senha', 500);
        }
    }

    /**
     * Valida um token JWT
     * @param token Token a ser validado
     */
    async validateToken(token: string): Promise<any> {
        try {
            logger.debug('Validando token JWT');
            return jwt.verify(token, process.env.JWT_SECRET!);
        } catch (error) {
            logger.warn('Token JWT inválido', { error: error.message });
            throw new AppError('Token inválido', 401);
        }
    }

    /**
     * Gera tokens de acesso e atualização para um usuário
     * @param user Usuário para gerar os tokens
     */
    private generateTokens(user: User): AuthTokens {
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET!,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
        );

        logger.debug('Tokens gerados com sucesso', { userId: user.id });
        return { accessToken, refreshToken };
    }

    /**
     * Remove campos sensíveis do objeto usuário
     * @param user Usuário a ser sanitizado
     */
    private sanitizeUser(user: User): Omit<User, 'password'> {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }
}

export default new AuthService(new UserRepository());
