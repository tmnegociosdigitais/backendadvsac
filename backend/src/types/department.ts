// Status possíveis de uma instância WhatsApp
export enum WhatsAppInstanceStatus {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    ERROR = 'error'
}

// Interface da instância WhatsApp
export interface WhatsAppInstance {
    id: string;
    name: string;
    status: WhatsAppInstanceStatus;
    qrCode?: string;
    lastConnection?: Date;
    ownerId: string;
}

// Interface do departamento
export interface Department {
    id: string;
    name: string;
    description?: string;
    whatsappInstanceId?: string;
    supervisors: string[]; // Array de userIds
    members: string[]; // Array de userIds
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// DTOs para criação/atualização
export interface CreateDepartmentDTO {
    name: string;
    description?: string;
    supervisors: string[];
    members: string[];
}

export interface UpdateDepartmentDTO {
    name?: string;
    description?: string;
    supervisors?: string[];
    members?: string[];
    active?: boolean;
    whatsappInstanceId?: string;
}
