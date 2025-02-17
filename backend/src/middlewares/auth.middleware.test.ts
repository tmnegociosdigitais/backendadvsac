import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, authorizeResource } from './auth.middleware';
import { UserRole } from '../types/auth';
import env from '../config/env';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
      path: '/test',
      method: 'GET'
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Não autorizado',
        message: 'Token de autenticação não fornecido'
      });
    });

    it('should return 401 if token is malformed', () => {
      mockRequest.headers = { authorization: 'Invalid Token' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Não autorizado',
        message: 'Token de autenticação inválido'
      });
    });

    it('should call next() with valid token', () => {
      const token = jwt.sign(
        { userId: '123', role: UserRole.ROLE_EMPLOYEE },
        env.jwt.secret
      );
      mockRequest.headers = { authorization: `Bearer ${token}` };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toEqual({
        userId: '123',
        role: UserRole.ROLE_EMPLOYEE
      });
    });
  });

  describe('authorize', () => {
    beforeEach(() => {
      mockRequest.user = {
        userId: '123',
        role: UserRole.ROLE_CONTRACTOR
      };
    });

    it('should allow access if user has required role', () => {
      const middleware = authorize(UserRole.ROLE_EMPLOYEE);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow access if user has higher role', () => {
      mockRequest.user = {
        userId: '123',
        role: UserRole.ROLE_OWNER
      };
      const middleware = authorize(UserRole.ROLE_CONTRACTOR);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access if user has lower role', () => {
      mockRequest.user = {
        userId: '123',
        role: UserRole.ROLE_EMPLOYEE
      };
      const middleware = authorize(UserRole.ROLE_CONTRACTOR);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso'
      });
    });

    it('should return 500 if user is not in request', () => {
      delete mockRequest.user;
      const middleware = authorize(UserRole.ROLE_EMPLOYEE);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro interno',
        message: 'Erro na validação de permissões'
      });
    });
  });

  describe('authorizeResource', () => {
    const resourceUserId = '123';

    beforeEach(() => {
      mockRequest.user = {
        userId: resourceUserId,
        role: UserRole.ROLE_EMPLOYEE
      };
    });

    it('should allow access if user is owner', () => {
      mockRequest.user = {
        userId: '456',
        role: UserRole.ROLE_OWNER
      };
      const middleware = authorizeResource(resourceUserId);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should allow access if user owns the resource', () => {
      const middleware = authorizeResource(resourceUserId);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access if user does not own the resource', () => {
      mockRequest.user = {
        userId: '456',
        role: UserRole.ROLE_EMPLOYEE
      };
      const middleware = authorizeResource(resourceUserId);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso'
      });
    });

    it('should return 500 if user is not in request', () => {
      delete mockRequest.user;
      const middleware = authorizeResource(resourceUserId);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro interno',
        message: 'Erro na validação de permissões'
      });
    });
  });
});
