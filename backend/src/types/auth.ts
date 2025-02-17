import { Request } from 'express';

export enum UserRole {
  ROLE_OWNER = 'ROLE_OWNER',
  ROLE_CONTRACTOR = 'ROLE_CONTRACTOR',
  ROLE_EMPLOYEE = 'ROLE_EMPLOYEE'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: string;
  active?: boolean;
}

export interface UserUpdateDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  departmentId?: string;
  active?: boolean;
  password?: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Estende o tipo Request do Express para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}
