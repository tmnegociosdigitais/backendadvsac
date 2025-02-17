import { UserRole } from './auth';
import { Message, ConnectionStatus } from './evolution';

// Interfaces para os eventos do Socket.IO
export interface ServerToClientEvents {
    // Dashboard
    'dashboard:metrics': (data: DashboardMetrics) => void;
    'dashboard:notification': (data: Notification) => void;

    // Atendimentos
    'atendimento:novo': (data: Atendimento) => void;
    'atendimento:atualizado': (data: Atendimento) => void;
    'atendimento:mensagem': (data: Mensagem) => void;
    'atendimento:status': (data: AtendimentoStatus) => void;

    // WhatsApp
    'whatsapp:connection': (data: ConnectionStatus) => void;
    'whatsapp:qr': (data: QRCode) => void;
    'whatsapp:message': (data: Message) => void;

    // CRM
    'crm:card:novo': (data: Card) => void;
    'crm:card:atualizado': (data: Card) => void;
    'crm:card:movido': (data: CardMovido) => void;
}

export interface ClientToServerEvents {
    // Autenticação
    'authenticate': (token: string) => void;

    // Salas
    'join:dashboard': () => void;
    'join:atendimentos': () => void;
    'leave:dashboard': () => void;
    'leave:atendimentos': () => void;

    // Status
    'status:update': (status: UserStatus) => void;

    // Atendimentos
    'atendimento:join': (id: string) => void;
    'atendimento:leave': (id: string) => void;
    'atendimento:mensagem': (data: EnviarMensagem) => void;

    // CRM
    'crm:subscribe': () => void;
    'crm:unsubscribe': () => void;
    'crm:card:mover': (data: MoverCard) => void;
}

// Interfaces de dados
export interface DashboardMetrics {
    atendimentosAtivos: number;
    atendimentosHoje: number;
    mensagensHoje: number;
    clientesNovos: number;
    tempoMedioEspera: number;
    tempoMedioAtendimento: number;
    atendentesOnline: number;
    satisfacaoMedia: number;
}

export interface Notification {
    tipo: 'info' | 'warning' | 'error' | 'success';
    mensagem: string;
    detalhes?: any;
}

export interface Atendimento {
    id: string;
    cliente: string;
    status: 'novo' | 'em_atendimento' | 'finalizado';
    responsavel?: string;
    departamento?: string;
    prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
    ultimaAtualizacao: Date;
    tempoEspera: number;
    tags?: string[];
}

export interface AtendimentoStatus {
    id: string;
    status: 'pending' | 'active' | 'resolved' | 'closed';
    updatedAt: Date;
    updatedBy: string;
}

export interface Mensagem {
    id: string;
    atendimentoId: string;
    remetente: string;
    conteudo: string;
    tipo: 'text' | 'image' | 'video' | 'audio' | 'document';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    metadata?: any;
}

export interface EnviarMensagem {
    atendimentoId: string;
    conteudo: string;
    tipo?: 'text' | 'image' | 'video' | 'audio' | 'document';
    metadata?: any;
}

export interface UserStatus {
    status: 'online' | 'away' | 'offline';
    lastActivity: Date;
    departamento?: string;
}

export interface QRCode {
    instance: string;
    qr: string;
    expiration: Date;
}

export interface Card {
    id: string;
    titulo: string;
    descricao: string;
    responsavel?: string;
    status: string;
    prioridade: 'baixa' | 'media' | 'alta';
    atendimentoId?: string;
    clienteId?: string;
    vencimento?: Date;
}

export interface CardMovido {
    cardId: string;
    origem: string;
    destino: string;
    responsavel: string;
    timestamp: Date;
}

export interface MoverCard {
    cardId: string;
    destino: string;
    responsavel?: string;
}