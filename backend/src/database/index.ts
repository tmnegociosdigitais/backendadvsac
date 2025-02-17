import { DataSource } from 'typeorm';
import { ormConfig } from '../config/orm.config';
import { logger } from '../config/logger';

class Database {
  private static instance: DataSource;

  static async initialize(): Promise<DataSource> {
    if (!Database.instance) {
      try {
        const dataSource = new DataSource(ormConfig);
        Database.instance = await dataSource.initialize();
        logger.info('Database connection initialized successfully');
      } catch (error) {
        logger.error('Error during database initialization:', error);
        throw error;
      }
    }
    return Database.instance;
  }

  static async getConnection(): Promise<DataSource> {
    if (!Database.instance) {
      await Database.initialize();
    }
    return Database.instance;
  }

  static async closeConnection(): Promise<void> {
    if (Database.instance) {
      await Database.instance.destroy();
      Database.instance = null;
      logger.info('Database connection closed');
    }
  }
}

export default Database;
