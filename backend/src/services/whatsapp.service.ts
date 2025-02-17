import evolutionApi from '../config/evolution-api';
import { WhatsAppMessage, WhatsAppTicket } from '../types/whatsapp';

class WhatsAppService {
  async sendMessage(to: string, content: string): Promise<WhatsAppMessage> {
    try {
      const response = await evolutionApi.post('/message/text', {
        number: to,
        message: content
      });

      return {
        id: response.data.key.id,
        from: response.data.key.remoteJid,
        to,
        content,
        timestamp: new Date(),
        type: 'text'
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error('Falha ao enviar mensagem');
    }
  }

  async createTicket(phone: string, initialMessage: string): Promise<WhatsAppTicket> {
    const ticket: WhatsAppTicket = {
      id: Math.random().toString(36).substring(7),
      status: 'open',
      customer: {
        phone,
        name: undefined
      },
      messages: [{
        id: Math.random().toString(36).substring(7),
        from: 'system',
        to: phone,
        content: initialMessage,
        timestamp: new Date(),
        type: 'text'
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Aqui você implementaria a lógica para salvar o ticket no banco de dados

    return ticket;
  }

  async getTickets(): Promise<WhatsAppTicket[]> {
    // Aqui você implementaria a lógica para buscar os tickets do banco de dados
    return [];
  }
}

export default new WhatsAppService();
