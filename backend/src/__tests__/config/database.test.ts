import { DataSource } from 'typeorm';
import { AppDataSource } from '../../config/database.config';
import { logger } from '../../config/logger';

describe('Configuração do Banco de Dados', () => {
  beforeAll(async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
    } catch (error) {
      logger.error('Erro ao inicializar banco de dados:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
      }
    } catch (error) {
      logger.error('Erro ao fechar conexão:', error);
      throw error;
    }
  });

  it('deve conectar ao banco de dados com sucesso', async () => {
    expect(AppDataSource.isInitialized).toBe(true);
  });

  it('deve ter as configurações corretas', () => {
    expect(AppDataSource.options.type).toBe('postgres');
    expect(AppDataSource.options.database).toBe('advsac_test');
  });

  it('deve ser capaz de executar queries', async () => {
    const result = await AppDataSource.query('SELECT 1 as number');
    expect(result[0].number).toBe(1);
  });
});
