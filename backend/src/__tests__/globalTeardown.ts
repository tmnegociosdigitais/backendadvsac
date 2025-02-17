import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

module.exports = async () => {
  // Carrega variáveis de ambiente do arquivo .env.test
  dotenv.config({
    path: path.join(__dirname, '../../.env.test')
  });

  // Configura o ambiente como teste
  process.env.NODE_ENV = 'test';

  // Cria uma conexão temporária para dropar o banco de dados de teste
  const tempDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: 'postgres', // Conecta ao banco padrão primeiro
  });

  try {
    await tempDataSource.initialize();
    
    // Tenta dropar o banco de dados de teste
    try {
      await tempDataSource.query(`DROP DATABASE IF EXISTS advsac_test`);
      console.log('Banco de dados de teste removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover banco de dados:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  } finally {
    if (tempDataSource.isInitialized) {
      await tempDataSource.destroy();
    }
  }
};
