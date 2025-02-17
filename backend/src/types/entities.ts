// Enums
export enum UserRole {
  OWNER = 'owner',
  CONTRACTOR = 'contractor',
  EMPLOYEE = 'employee'
}

export enum MessageDirection {
  INCOMING = 'incoming',
  OUTGOING = 'outgoing'
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum CardPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum CardStatus {
  LEADS = 'leads',
  PROSPECTING = 'prospecting',
  NEGOTIATION = 'negotiation',
  CONTRACTS = 'contracts',
  PROCESSES = 'processes',
  ARCHIVED = 'archived'
}

// Interfaces
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClient {
  id: string;
  whatsappNumber: string;
  name: string;
  lastInteraction: Date;
  lastMessage: string;
  conversationStatus: ConversationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  id: string;
  clientId: string;
  content: string;
  timestamp: Date;
  direction: MessageDirection;
  status: MessageStatus;
  evolutionApiMessageId: string;
  messageOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  priority: CardPriority;
  responsibleId: string;
  clientId: string;
  dueDate?: Date;
  tags: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}
