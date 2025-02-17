import { Request, Response, NextFunction } from 'express';
import { logger, requestLogger, errorLogger } from './logger';
import path from 'path';
import fs from 'fs';

describe('Logger Configuration', () => {
  const logPath = path.join(__dirname, '../../logs/test.log');
  
  beforeEach(() => {
    // Limpa arquivos de log antes de cada teste
    if (fs.existsSync(logPath)) {
      fs.unlinkSync(logPath);
    }
  });

  it('should create log directory if it does not exist', () => {
    const logDir = path.dirname(logPath);
    expect(fs.existsSync(logDir)).toBeTruthy();
  });

  it('should log messages correctly', () => {
    const testMessage = 'Test log message';
    logger.info(testMessage);

    const logContent = fs.readFileSync(logPath, 'utf8');
    const logEntry = JSON.parse(logContent);
    
    expect(logEntry.message).toBe(testMessage);
    expect(logEntry.level).toBe('info');
    expect(logEntry.timestamp).toBeDefined();
  });

  describe('Request Logger Middleware', () => {
    it('should log HTTP requests', (done) => {
      const req = {
        method: 'GET',
        url: '/test',
        ip: '127.0.0.1',
        get: (header: string) => 'test-agent',
        body: { password: 'secret123' },
        query: { q: 'test' }
      } as unknown as Request;

      const res = {
        statusCode: 200,
        on: (event: string, cb: () => void) => {
          if (event === 'finish') {
            cb();
          }
        }
      } as unknown as Response;

      const next = () => {
        const logContent = fs.readFileSync(logPath, 'utf8');
        const logEntry = JSON.parse(logContent);

        expect(logEntry.method).toBe('GET');
        expect(logEntry.url).toBe('/test');
        expect(logEntry.status).toBe(200);
        expect(logEntry.body.password).toBe('[REDACTED]');
        done();
      };

      requestLogger(req, res, next as NextFunction);
    });
  });

  describe('Error Logger Middleware', () => {
    it('should log errors correctly', () => {
      const error = new Error('Test error');
      const req = {
        method: 'POST',
        url: '/test',
        body: { sensitive: 'data' }
      } as unknown as Request;

      const res = {} as Response;
      const next = () => {};

      errorLogger(error, req, res, next);

      const logContent = fs.readFileSync(logPath, 'utf8');
      const logEntry = JSON.parse(logContent);

      expect(logEntry.error.message).toBe('Test error');
      expect(logEntry.error.stack).toBeDefined();
      expect(logEntry.request.method).toBe('POST');
    });
  });
});
