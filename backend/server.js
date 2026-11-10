require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const { sequelize } = require('./src/models');
const { seedInitialData } = require('./src/seeders/initialSeed');

const PORT = process.env.PORT || 3001;

// Inicialização encadeada com Promises (Conexão -> Sync Sequelize -> Seed Inicial -> Start Express)
connectDatabase()
  .then(() => {
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Tabelas sincronizadas no PostgreSQL via Sequelize.');
    return seedInitialData();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🏈 Servidor Back-end Palpitando NFL rodando em: http://localhost:${PORT}`);
      console.log(`📚 Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((error) => {
    console.error('❌ Falha crítica ao iniciar o servidor Back-end:', error);
    process.exit(1);
  });
