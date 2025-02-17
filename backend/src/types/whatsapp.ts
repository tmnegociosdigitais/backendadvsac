export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
}

export interface WhatsAppTicket {
  id: string;
  status: 'open' | 'pending' | 'closed';
  customer: {
    phone: string;
    name?: string;
  };
  assignedTo?: string;
  messages: WhatsAppMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  nodes: ChatbotNode[];
  connections: ChatbotConnection[];
}

export interface ChatbotNode {
  id: string;
  type: 'message' | 'condition' | 'action';
  content: string;
  position: {
    x: number;
    y: number;
  };
}

export interface ChatbotConnection {
  id: string;
  from: string;
  to: string;
  condition?: string;
}
