import dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from '../config/database.config';
import env from '../config/env';
import { logger } from '../config/logger';

// Carrega variáveis de ambiente do arquivo .env.test
const envPath = path.join(__dirname, '../../.env.test');
logger.info(`Carregando variáveis de ambiente de: ${envPath}`);
dotenv.config({ path: envPath });

// Configurações globais para testes
env.app.env = 'test';

// Configuração global do Jest
beforeAll(async () => {
    // Inicializa o banco de dados de teste
    if (env.app.env === 'test') {
        try {
            await initializeDatabase();
            logger.info('Banco de dados de teste criado com sucesso');
        } catch (error) {
            logger.error('Erro ao criar banco de dados de teste:', error);
            throw error;
        }
    }
});

afterAll(async () => {
    // Limpa o banco de dados de teste
    if (env.app.env === 'test') {
        try {
            // Aqui você pode adicionar lógica para limpar o banco de dados
            logger.info('Banco de dados de teste removido com sucesso');
        } catch (error) {
            logger.error('Erro ao remover banco de dados de teste:', error);
            throw error;
        }
    }
});
