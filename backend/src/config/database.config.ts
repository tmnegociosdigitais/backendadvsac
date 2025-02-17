import { DataSource } from 'typeorm';
import { logger } from './logger';
import env from './env';
import path from 'path';

// Configuração do banco de dados
const config = {
    type: 'postgres' as const,
    host: env.database.host,
    port: env.database.port,
    username: env.database.username,
    password: env.database.password,
    database: env.app.env === 'test' ? env.database.testDatabase : env.database.database,
    entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
    synchronize: env.app.env === 'development',
    logging: env.app.env === 'development',
    dropSchema: env.app.env === 'test'
};

// Cria a instância do DataSource
export const AppDataSource = new DataSource(config);

/**
 * Inicializa a conexão com o banco de dados
 */
export async function initializeDatabase(): Promise<void> {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            logger.info('Banco de dados inicializado com sucesso');
        }
    } catch (error) {
        logger.error('Erro ao inicializar banco de dados:', error);
        throw error;
    }
}

/**
 * Fecha a conexão com o banco de dados
 */
export async function closeDatabase(): Promise<void> {
    try {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            logger.info('Conexão com banco de dados fechada com sucesso');
        }
    } catch (error) {
        logger.error('Erro ao fechar conexão com banco de dados:', error);
        throw error;
    }
}
