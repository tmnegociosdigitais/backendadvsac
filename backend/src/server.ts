import { app, server } from './app';
import { logger } from './config/logger';
import env from './config/env';
import Database from './database';

// Inicializar banco de dados
Database.initialize()
  .then(() => {
    // Inicia o servidor
    server.listen(env.app.port, () => {
      logger.info(`Servidor rodando na porta ${env.app.port}`);
      logger.info('Banco de dados conectado com sucesso');
    });
  })
  .catch((error) => {
    logger.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  });
