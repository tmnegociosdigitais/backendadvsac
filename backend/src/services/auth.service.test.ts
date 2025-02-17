import authService from './auth.service';
import { UserRole } from '../types/auth';
import jwt from 'jsonwebtoken';
import env from '../config/env';

describe('AuthService', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: UserRole.ROLE_EMPLOYEE
  };

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const user = await authService.createUser(mockUser);
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(mockUser.email);
      expect(user).not.toHaveProperty('password');
    });

    it('should not allow duplicate emails', async () => {
      await expect(authService.createUser(mockUser))
        .rejects
        .toThrow('Email já está em uso');
    });
  });

  describe('login', () => {
    it('should authenticate user with correct credentials', async () => {
      const auth = await authService.login(mockUser.email, mockUser.password);
      expect(auth).toHaveProperty('token');
      expect(auth.user.email).toBe(mockUser.email);
      expect(auth.user).not.toHaveProperty('password');
    });

    it('should not authenticate with wrong password', async () => {
      await expect(authService.login(mockUser.email, 'wrongpass'))
        .rejects
        .toThrow('Credenciais inválidas');
    });

    it('should not authenticate non-existent user', async () => {
      await expect(authService.login('wrong@email.com', 'anypass'))
        .rejects
        .toThrow('Credenciais inválidas');
    });
  });

  describe('updateUser', () => {
    let userId: string;

    beforeAll(async () => {
      const user = await authService.createUser({
        ...mockUser,
        email: 'update@example.com'
      });
      userId = user.id;
    });

    it('should update user successfully', async () => {
      const newName = 'Updated Name';
      const updated = await authService.updateUser(userId, { name: newName });
      expect(updated.name).toBe(newName);
    });

    it('should not update non-existent user', async () => {
      await expect(authService.updateUser('invalid-id', { name: 'New Name' }))
        .rejects
        .toThrow('Usuário não encontrado');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = jwt.sign({ userId: '123', role: UserRole.ROLE_EMPLOYEE }, env.jwt.secret);
      const payload = authService.verifyToken(token);
      expect(payload).toHaveProperty('userId', '123');
      expect(payload).toHaveProperty('role', UserRole.ROLE_EMPLOYEE);
    });

    it('should reject invalid token', () => {
      expect(() => authService.verifyToken('invalid-token'))
        .toThrow('Token inválido');
    });
  });
});
