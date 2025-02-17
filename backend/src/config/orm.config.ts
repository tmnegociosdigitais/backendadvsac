import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../entities/user.entity';
import { Client } from '../entities/client.entity';
import { Message } from '../entities/message.entity';
import { Card } from '../entities/card.entity';

// Carrega as variáveis de ambiente
config();

export const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Client, Message, Card],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  // Configurações adicionais para produção
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Cache configurado para Redis (será implementado posteriormente)
  cache: false
};
