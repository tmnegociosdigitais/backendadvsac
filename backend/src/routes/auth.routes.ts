import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate, authorize, authorizeResource } from '../middlewares/auth.middleware';
import { UserRole } from '../types/auth';

const router = Router();

// Rotas públicas
router.post('/login', authController.login);

// Registro - apenas ROLE_OWNER pode registrar novos usuários
router.post('/register', 
  authenticate, 
  authorize(UserRole.ROLE_OWNER), 
  authController.register
);

// Atualização de usuário
router.put('/users/:userId', 
  authenticate, 
  authorize(UserRole.ROLE_EMPLOYEE),
  authorizeResource('userId'), // Usuário só pode atualizar seu próprio perfil
  authController.updateUser
);

// Listagem de usuários - apenas ROLE_OWNER e ROLE_CONTRACTOR
router.get('/users', 
  authenticate, 
  authorize(UserRole.ROLE_CONTRACTOR),
  authController.listUsers
);

// Detalhes do usuário
router.get('/users/:userId',
  authenticate,
  authorize(UserRole.ROLE_EMPLOYEE),
  authorizeResource('userId'), // Usuário só pode ver seus próprios detalhes
  authController.getUserDetails
);

// Desativar usuário - apenas ROLE_OWNER
router.delete('/users/:userId',
  authenticate,
  authorize(UserRole.ROLE_OWNER),
  authController.deactivateUser
);

// Rota para obter o perfil do usuário logado
router.get('/profile',
  authenticate,
  authController.getProfile
);

// Rota para refresh token
router.post('/refresh-token',
  authenticate,
  authController.refreshToken
);

export default router;
