# Frontend (Next.js + TypeScript)

## Estrutura de Diretórios

```
/frontend
├── /src
│   ├── /components    # Componentes React reutilizáveis
│   ├── /pages        # Rotas e páginas da aplicação
│   ├── /styles       # Estilos globais e temas
│   ├── /hooks        # Hooks personalizados
│   ├── /services     # Serviços de API e integrações
│   ├── /utils        # Funções utilitárias
│   ├── /contexts     # Contextos React
│   └── /types        # Definições de tipos TypeScript
```

## Componentes Principais

### 1. Dashboard
- Métricas em tempo real
- Gráficos e estatísticas
- Visão geral do sistema

### 2. Atendimentos
- Lista de atendimentos
- Chat em tempo real
- Gestão de filas

### 3. CRM Kanban
- Board de leads
- Drag and drop de cards
- Filtros e busca

### 4. Chatbot
- Construtor de fluxos
- Visualização de nós
- Configuração de respostas

## Integração com Socket.IO

### Namespaces
```typescript
// Exemplo de uso dos namespaces
import { useSocket } from '@/hooks/useSocket';

// Namespace de atendimento
const attendanceSocket = useSocket('attendance');
attendanceSocket.on('newTicket', handleNewTicket);

// Namespace do dashboard
const dashboardSocket = useSocket('dashboard');
dashboardSocket.on('metricsUpdate', handleMetricsUpdate);
```

### Eventos Principais

1. **Attendance**
   - `newTicket`: Novo ticket criado
   - `ticketUpdated`: Ticket atualizado
   - `messageReceived`: Nova mensagem recebida

2. **Dashboard**
   - `metricsUpdate`: Atualização de métricas
   - `statusChange`: Mudança de status
   - `performanceData`: Dados de performance

3. **Queue**
   - `queueUpdate`: Atualização da fila
   - `agentStatus`: Status dos agentes
   - `distributionEvent`: Evento de distribuição

## Hooks Personalizados

### useSocket
```typescript
const useSocket = (namespace: string) => {
  const socket = useMemo(() => {
    return io(`${process.env.NEXT_PUBLIC_API_URL}/${namespace}`, {
      auth: { token: getToken() }
    });
  }, [namespace]);

  return socket;
};
```

### useEvolution
```typescript
const useEvolution = () => {
  const socket = useSocket('evolution');

  const sendMessage = useCallback(async (message) => {
    return socket.emit('sendMessage', message);
  }, [socket]);

  return { sendMessage };
};
```

## Autenticação

### JWT
```typescript
// Interceptor para adicionar token
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Boas Práticas

1. **Performance**
   - Usar React.memo para componentes puros
   - Implementar virtualização para listas longas
   - Otimizar re-renders com useMemo/useCallback

2. **Segurança**
   - Validar inputs do usuário
   - Sanitizar dados recebidos
   - Implementar rate limiting no cliente

3. **UX/UI**
   - Feedback imediato para ações
   - Loading states para operações
   - Tratamento de erros amigável

## Desenvolvimento

```bash
# Instalação
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test
```

## Troubleshooting

### Problemas Comuns
1. **Conexão Socket.IO**
   - Verificar URL do servidor
   - Confirmar token válido
   - Checar CORS settings

2. **Performance**
   - Identificar re-renders desnecessários
   - Otimizar queries e chamadas
   - Implementar lazy loading

3. **Estado**
   - Usar ferramentas de debug
   - Verificar fluxo de dados
   - Validar atualizações de estado
