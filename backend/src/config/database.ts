import { DataSource } from 'typeorm';
import env from './env';
import { logger } from './logger';
import { User } from '../entities/user.entity';

/**
 * Configuração do DataSource do TypeORM
 * Gerencia a conexão com o banco de dados PostgreSQL
 * Configura entidades, migrations e subscribers
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  username: env.database.user,
  password: env.database.password,
  database: env.database.name,
  synchronize: env.server.isDevelopment, // Apenas em desenvolvimento
  logging: env.server.isDevelopment,
  entities: [User], // Lista de entidades
  migrations: [], // Migrations serão adicionadas aqui
  subscribers: [] // Subscribers serão adicionados aqui
});

/**
 * Inicializa a conexão com o banco de dados
 * Executa as migrations pendentes automaticamente
 * @throws Error se a conexão falhar
 */
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    logger.info('Banco de dados inicializado com sucesso');
  } catch (error) {
    logger.error('Erro ao inicializar banco de dados', { 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
    throw error;
  }
};
