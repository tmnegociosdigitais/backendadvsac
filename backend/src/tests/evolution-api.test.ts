import EvolutionService from '../services/evolution.service';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const evolutionService = new EvolutionService({
    apiUrl: process.env.EVOLUTION_API_BASE_URL!,
    apiKey: process.env.EVOLUTION_API_KEY!,
    webhookUrl: process.env.WEBHOOK_BASE_URL!
});

async function testConnection() {
    try {
        // Tenta criar uma nova instância
        const instanceName = `test-${Date.now()}`;
        const instance = await evolutionService.createInstance(instanceName);
        console.log('Instância criada com sucesso:', instance);

        // Tenta gerar QR Code
        const qrCode = await evolutionService.connect(instanceName);
        console.log('QR Code gerado:', qrCode);

        // Verifica o status
        const status = await evolutionService.getStatus(instanceName);
        console.log('Status da instância:', status);

        // Limpa o teste deletando a instância
        await evolutionService.deleteInstance(instanceName);
        console.log('Instância deletada com sucesso');

    } catch (error) {
        console.error('Erro no teste:', error);
    }
}

// Executa o teste
testConnection();
