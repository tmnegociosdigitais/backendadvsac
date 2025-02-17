import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/auth';
import authService from '../services/auth.service';
import { AppError } from '../utils/errors';
import { logger } from '../config/logger';

/**
 * Define a hierarquia de permissões para cada papel no sistema
 * Cada papel herda as permissões dos papéis abaixo dele na hierarquia
 * ROLE_OWNER: tem acesso a tudo
 * ROLE_CONTRACTOR: tem acesso às suas funcionalidades e às do ROLE_EMPLOYEE
 * ROLE_EMPLOYEE: tem acesso apenas às funcionalidades básicas
 */
const roleHierarchy: { [key in UserRole]: UserRole[] } = {
    [UserRole.ROLE_OWNER]: [UserRole.ROLE_OWNER, UserRole.ROLE_CONTRACTOR, UserRole.ROLE_EMPLOYEE],
    [UserRole.ROLE_CONTRACTOR]: [UserRole.ROLE_CONTRACTOR, UserRole.ROLE_EMPLOYEE],
    [UserRole.ROLE_EMPLOYEE]: [UserRole.ROLE_EMPLOYEE]
};

/**
 * Middleware de autenticação que verifica se o usuário está autenticado
 * Valida o token JWT no header Authorization e adiciona as informações do usuário ao request
 * 
 * @param req Request do Express
 * @param res Response do Express
 * @param next Função next do Express
 * @throws AppError(401) se o token não for fornecido ou for inválido
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.warn('Tentativa de acesso sem token de autenticação');
            throw new AppError('Token não fornecido', 401);
        }

        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            logger.warn('Token mal formatado', { header: authHeader });
            throw new AppError('Token de autenticação inválido', 401);
        }

        const decoded = await authService.validateToken(token);
        req.user = decoded;

        logger.debug('Usuário autenticado com sucesso', {
            userId: decoded.userId,
            role: decoded.role,
            path: req.path,
            method: req.method
        });

        next();
    } catch (error) {
        logger.error('Erro de autenticação:', { 
            error: error.message,
            path: req.path,
            method: req.method
        });
        res.status(401).json({ error: 'Não autorizado' });
    }
};

/**
 * Middleware de autorização baseado em papéis (RBAC)
 * Verifica se o usuário tem o papel mínimo necessário para acessar o recurso
 * Utiliza a hierarquia de papéis definida em roleHierarchy
 * 
 * @param minRole Papel mínimo necessário para acessar o recurso
 * @returns Middleware do Express
 * @throws AppError(401) se o usuário não estiver autenticado
 * @throws AppError(403) se o usuário não tiver o papel necessário
 */
export const authorize = (minRole: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                logger.error('Middleware de autorização usado sem autenticação prévia', {
                    path: req.path,
                    method: req.method
                });
                throw new AppError('Usuário não autenticado', 401);
            }

            const userRole = req.user.role as UserRole;
            const allowedRoles = roleHierarchy[userRole];

            if (!allowedRoles.includes(minRole)) {
                logger.warn('Tentativa de acesso não autorizado', {
                    userId: req.user.userId,
                    userRole: userRole,
                    requiredRole: minRole,
                    path: req.path,
                    method: req.method
                });
                throw new AppError('Acesso negado', 403);
            }

            logger.debug('Acesso autorizado', {
                userId: req.user.userId,
                role: userRole,
                path: req.path,
                method: req.method
            });

            next();
        } catch (error) {
            logger.error('Erro de autorização:', { 
                error: error.message,
                user: req.user,
                path: req.path,
                method: req.method
            });
            res.status(403).json({ error: 'Acesso negado' });
        }
    };
};

/**
 * Middleware que verifica se o usuário tem acesso a um recurso específico
 * Usado para verificar permissões em nível de recurso (ex: tickets, departamentos)
 * ROLE_OWNER tem acesso automático a qualquer recurso
 * 
 * @param resourceType Tipo do recurso sendo acessado (ex: 'ticket', 'department')
 * @returns Middleware do Express
 * @throws AppError(401) se o usuário não estiver autenticado
 * @throws AppError(403) se o usuário não tiver acesso ao recurso
 */
export const authorizeResource = (resourceType: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;

            if (!userId) {
                logger.error('Middleware de autorização de recurso usado sem autenticação prévia', {
                    path: req.path,
                    method: req.method
                });
                throw new AppError('Usuário não autenticado', 401);
            }

            // Se for ROLE_OWNER, permite acesso a qualquer recurso
            if (req.user?.role === UserRole.ROLE_OWNER) {
                logger.debug('Acesso permitido para ROLE_OWNER', {
                    userId,
                    resourceType,
                    resourceId: id
                });
                return next();
            }

            // Verifica se o usuário tem acesso ao recurso específico
            const hasAccess = await checkResourceAccess(resourceType, id, userId);
            if (!hasAccess) {
                logger.warn('Tentativa de acesso não autorizado a recurso', {
                    userId,
                    resourceType,
                    resourceId: id
                });
                throw new AppError('Acesso negado ao recurso', 403);
            }

            logger.debug('Acesso ao recurso autorizado', {
                userId,
                resourceType,
                resourceId: id
            });

            next();
        } catch (error) {
            logger.error('Erro de autorização de recurso:', {
                error: error.message,
                user: req.user,
                path: req.path,
                method: req.method
            });
            res.status(403).json({ error: 'Acesso negado ao recurso' });
        }
    };
};

/**
 * Função auxiliar que verifica se um usuário tem acesso a um recurso específico
 * Implementa a lógica de verificação baseada no tipo do recurso
 * 
 * @param resourceType Tipo do recurso (ex: 'ticket', 'department')
 * @param resourceId ID do recurso sendo acessado
 * @param userId ID do usuário que está tentando acessar
 * @returns Promise<boolean> indicando se o acesso é permitido
 */
async function checkResourceAccess(resourceType: string, resourceId: string, userId: string): Promise<boolean> {
    logger.debug('Verificando acesso a recurso', { resourceType, resourceId, userId });

    try {
        switch (resourceType) {
            case 'ticket':
                // Verificar se o usuário tem acesso ao ticket
                // Implementar lógica real de acesso ao ticket
                return true;
            case 'department':
                // Verificar se o usuário pertence ao departamento
                // Implementar lógica real de acesso ao departamento
                return true;
            default:
                logger.warn('Tipo de recurso desconhecido', { resourceType });
                return false;
        }
    } catch (error) {
        logger.error('Erro ao verificar acesso a recurso', {
            error: error.message,
            resourceType,
            resourceId,
            userId
        });
        return false;
    }
}
