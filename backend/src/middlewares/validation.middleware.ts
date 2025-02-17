import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from '../utils/errors';

export function validateDto(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Converte o body da requisição para a classe DTO
            const dtoObject = plainToClass(dtoClass, req.body);

            // Valida o objeto usando class-validator
            const errors = await validate(dtoObject);

            if (errors.length > 0) {
                // Formata os erros de validação
                const formattedErrors = errors.map(error => ({
                    property: error.property,
                    constraints: error.constraints
                }));

                throw new AppError('Erro de validação', 400, formattedErrors);
            }

            // Se não houver erros, continua
            req.body = dtoObject;
            next();
        } catch (error) {
            next(error);
        }
    };
}
