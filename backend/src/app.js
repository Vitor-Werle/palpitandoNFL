const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const predictionRoutes = require('./routes/predictionRoutes');
const gameRoutes = require('./routes/gameRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Documentação Interativa Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota raiz informativa
app.get('/', (req, res) => {
  res.json({
    application: 'Palpitando NFL - Back-end API (MVC + Sequelize + PostgreSQL)',
    status: 'Online',
    swaggerDocs: 'http://localhost:3001/api-docs',
    endpoints: {
      predictions: '/api/predictions',
      games: '/api/games',
      users: '/api/users',
      ranking: '/api/users/ranking'
    }
  });
});

// Rotas MVC
app.use('/api/predictions', predictionRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
