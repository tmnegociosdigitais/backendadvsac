import winston from 'winston';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');

// Logger principal
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Logger específico para requisições
const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'requests.log')
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Logger específico para erros
const errorLogger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log')
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export { logger, requestLogger, errorLogger };
