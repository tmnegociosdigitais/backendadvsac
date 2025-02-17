import { createClient } from 'redis';
import { logger } from './logger';
import env from './env';

export const createRedisClient = async () => {
    const client = createClient({
        url: env.redis.url,
        password: env.redis.password,
        database: env.redis.database,
        socket: {
            reconnectStrategy: (retries) => {
                if (retries > 10) {
                    logger.error('Máximo de tentativas de reconexão Redis atingido');
                    return new Error('Máximo de tentativas de reconexão Redis atingido');
                }
                return Math.min(retries * 100, 3000);
            },
            connectTimeout: 10000,
            keepAlive: 5000
        }
    });

    client.on('error', (err) => {
        logger.error('Erro no cliente Redis:', err);
    });

    client.on('connect', () => {
        logger.info('Cliente Redis conectado');
    });

    client.on('ready', () => {
        logger.info('Cliente Redis pronto para uso');
    });

    client.on('reconnecting', () => {
        logger.warn('Cliente Redis reconectando...');
    });

    await client.connect();
    return client;
};

export const createRedisSubscriber = async () => {
    const subscriber = createClient({
        url: env.redis.url,
        password: env.redis.password,
        database: env.redis.database
    });

    subscriber.on('error', (err) => {
        logger.error('Erro no subscriber Redis:', err);
    });

    await subscriber.connect();
    return subscriber;
};

export const createRedisPublisher = async () => {
    const publisher = createClient({
        url: env.redis.url,
        password: env.redis.password,
        database: env.redis.database
    });

    publisher.on('error', (err) => {
        logger.error('Erro no publisher Redis:', err);
    });

    await publisher.connect();
    return publisher;
};
