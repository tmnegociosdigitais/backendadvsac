# Sistema de Autenticação e Autorização

## Visão Geral
O sistema implementa um mecanismo robusto de autenticação e autorização baseado em JWT (JSON Web Tokens) com suporte a hierarquia de papéis.

## Hierarquia de Papéis

### 1. ROLE_OWNER (Proprietário)
- Acesso total ao sistema
- Pode criar outros proprietários
- Gerencia funções de usuários
- Acesso a todas as configurações

### 2. ROLE_CONTRACTOR (Contratante)
- Gerenciamento de equipe
- Visualização de relatórios
- Acesso a configurações específicas
- Não pode criar proprietários

### 3. ROLE_EMPLOYEE (Funcionário)
- Acesso básico ao sistema
- Funções operacionais
- Acesso apenas aos próprios recursos

## Endpoints da API

### Autenticação
```typescript
// Login
POST /auth/login
{
  "email": "string",
  "password": "string"
}

// Refresh Token
POST /auth/refresh-token
{
  "refreshToken": "string"
}
```

### Gestão de Usuários
```typescript
// Criar usuário
POST /auth/register
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "ROLE_EMPLOYEE"
}

// Listar usuários
GET /auth/users

// Detalhes do usuário
GET /auth/users/:userId

// Atualizar usuário
PUT /auth/users/:userId

// Desativar usuário
DELETE /auth/users/:userId
```

## Middlewares de Segurança

### 1. authenticate
```typescript
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError();
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
```

### 2. authorize
```typescript
const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
};
```

### 3. authorizeResource
```typescript
const authorizeResource = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const resource = await Resource.findOne(req.params.id);
    if (!resource) throw new NotFoundError();
    
    if (!canAccessResource(req.user, resource)) {
      throw new ForbiddenError();
    }
    next();
  } catch (error) {
    next(error);
  }
};
```

## Segurança e Boas Práticas

### 1. Tokens JWT
- Tempo de expiração configurável
- Payload mínimo por segurança
- Refresh token para melhor UX

### 2. Senhas
- Armazenamento com hash bcrypt
- Validações de força
- Tentativas de login monitoradas

### 3. Logging
- Registro detalhado de ações
- Monitoramento de tentativas suspeitas
- Auditoria de alterações

### 4. Validações
- Dados de entrada sanitizados
- Verificações de unicidade
- Validações de regras de negócio

## Exemplos de Uso

### Login
```typescript
const login = async (email: string, password: string) => {
  const user = await validateCredentials(email, password);
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return { token, refreshToken, user };
};
```

### Proteção de Rotas
```typescript
router.get('/users', 
  authenticate,
  authorize(['ROLE_CONTRACTOR', 'ROLE_OWNER']),
  listUsers
);

router.put('/users/:id',
  authenticate,
  authorizeResource,
  updateUser
);
```

## Troubleshooting

### Problemas Comuns
1. Token Expirado
   - Usar refresh token
   - Verificar timezone
   - Validar configurações

2. Permissões Incorretas
   - Verificar hierarquia
   - Validar papel do usuário
   - Checar logs

3. Falhas de Autenticação
   - Validar credenciais
   - Verificar headers
   - Conferir formato do token
