import { Router } from 'express';
import departmentController from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Rota para criar departamento (OWNER e CONTRACTOR)
router.post('/',
    authenticate,
    authorize(UserRole.ROLE_CONTRACTOR),
    departmentController.create
);

// Rota para atualizar departamento (OWNER, CONTRACTOR e Supervisores)
router.put('/:id',
    authenticate,
    authorize(UserRole.ROLE_EMPLOYEE), // A verificação específica é feita no serviço
    departmentController.update
);

// Rota para deletar departamento (apenas OWNER)
router.delete('/:id',
    authenticate,
    authorize(UserRole.ROLE_OWNER),
    departmentController.delete
);

// Rota para buscar departamento por ID
router.get('/:id',
    authenticate,
    authorize(UserRole.ROLE_EMPLOYEE), // A verificação específica é feita no serviço
    departmentController.getById
);

// Rota para listar departamentos do usuário
router.get('/',
    authenticate,
    authorize(UserRole.ROLE_EMPLOYEE),
    departmentController.list
);

export default router;
