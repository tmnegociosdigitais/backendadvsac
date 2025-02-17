/**
 * Classe de erro personalizada para a aplicação
 */
export class AppError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Classe de erro para validação
 */
export class ValidationError extends AppError {
    constructor(message: string, details?: any) {
        super(message, 400, details);
        this.name = 'ValidationError';
    }
}

/**
 * Classe de erro para autenticação
 */
export class AuthenticationError extends AppError {
    constructor(message: string = 'Não autorizado') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Classe de erro para autorização
 */
export class AuthorizationError extends AppError {
    constructor(message: string = 'Acesso negado') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Classe de erro para recursos não encontrados
 */
export class NotFoundError extends AppError {
    constructor(message: string = 'Recurso não encontrado') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
