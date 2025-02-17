import { logger } from '../../config/logger';
import fs from 'fs';
import path from 'path';

describe('Logger Configuration', () => {
    const logDir = path.join(__dirname, '../../../logs');
    const logFile = path.join(logDir, 'test.log');

    beforeEach(() => {
        // Limpa os arquivos de log antes de cada teste
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
        }
    });

    afterEach(() => {
        // Limpa os arquivos de log após cada teste
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
        }
    });

    it('should create log directory if it does not exist', () => {
        // Remove o diretório de logs se existir
        if (fs.existsSync(logDir)) {
            fs.rmdirSync(logDir, { recursive: true });
        }

        // Cria um log para forçar a criação do diretório
        logger.info('Test log');

        // Verifica se o diretório foi criado
        expect(fs.existsSync(logDir)).toBe(true);
    });

    it('should write logs to file', () => {
        const testMessage = 'Test log message';
        logger.info(testMessage);

        // Verifica se o arquivo de log foi criado
        expect(fs.existsSync(logFile)).toBe(true);

        // Verifica se a mensagem foi escrita no arquivo
        const logContent = fs.readFileSync(logFile, 'utf8');
        expect(logContent).toContain(testMessage);
    });

    it('should include timestamp in logs', () => {
        logger.info('Test log with timestamp');

        const logContent = fs.readFileSync(logFile, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.length > 0);
        const lastLog = logLines[logLines.length - 1];

        // Verifica se o log contém um timestamp ISO
        expect(lastLog).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle error logs', () => {
        const errorMessage = 'Test error message';
        const error = new Error(errorMessage);
        logger.error('Error occurred:', error);

        const logContent = fs.readFileSync(logFile, 'utf8');
        expect(logContent).toContain(errorMessage);
        expect(logContent).toContain('Error occurred');
    });

    it('should handle objects in logs', () => {
        const testObject = { key: 'value', nested: { prop: 'test' } };
        logger.info('Test object:', testObject);

        const logContent = fs.readFileSync(logFile, 'utf8');
        expect(logContent).toContain('key');
        expect(logContent).toContain('value');
        expect(logContent).toContain('nested');
    });
});
