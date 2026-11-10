require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'palpitando_nfl',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

/**
 * Testa a conexão com o banco PostgreSQL retornando uma Promise explícita
 */
function connectDatabase() {
  return new Promise((resolve, reject) => {
    sequelize
      .authenticate()
      .then(() => {
        console.log('✅ Conexão com o PostgreSQL estabelecida com sucesso via Sequelize.');
        resolve(sequelize);
      })
      .catch((error) => {
        console.error('❌ Erro ao conectar no PostgreSQL:', error.message);
        reject(error);
      });
  });
}

module.exports = {
  sequelize,
  connectDatabase
};
