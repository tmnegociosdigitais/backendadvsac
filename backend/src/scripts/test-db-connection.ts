import { AppDataSource, initializeDatabase } from '../config/database.config';

async function testConnection() {
  try {
    await initializeDatabase();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    
    // Testa uma query simples
    const result = await AppDataSource.query('SELECT NOW()');
    console.log('🕒 Hora atual do banco:', result[0].now);
    
    await AppDataSource.destroy();
    console.log('✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error);
    process.exit(1);
  }
}

testConnection();
