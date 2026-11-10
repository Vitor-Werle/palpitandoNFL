const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Palpitando NFL - API RESTful (MVC + Sequelize + PostgreSQL)',
      version: '1.0.0',
      description:
        'Documentação interativa da API do sistema de Palpites e Ranking da NFL. Desenvolvida com Node.js, Express, Sequelize ORM, PostgreSQL e Promises.'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor Local de Desenvolvimento'
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'vitor_nfl' },
            email: { type: 'string', example: 'vitor@nfl.com' },
            state: { type: 'string', example: 'SP' },
            favoriteTeam: { type: 'string', example: 'KC' },
            points: { type: 'integer', example: 8 },
            hits: { type: 'integer', example: 4 },
            misses: { type: 'integer', example: 1 },
            exactScores: { type: 'integer', example: 1 },
            eligibleForRanking: { type: 'boolean', example: true },
            isVerified: { type: 'boolean', example: true }
          }
        },
        Game: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            week: { type: 'integer', example: 10 },
            season: { type: 'integer', example: 2026 },
            homeTeam: { type: 'string', example: 'Kansas City Chiefs' },
            homeTeamAbbr: { type: 'string', example: 'KC' },
            awayTeam: { type: 'string', example: 'Buffalo Bills' },
            awayTeamAbbr: { type: 'string', example: 'BUF' },
            kickoffTime: { type: 'string', format: 'date-time' },
            stadium: { type: 'string', example: 'Arrowhead Stadium - Kansas City, MO' },
            injuryReport: { type: 'string', example: 'KC: Isiah Pacheco (Dúvida) | BUF: Matt Milano (Fora)' },
            status: { type: 'string', enum: ['SCHEDULED', 'FINAL', 'POSTPONED'], example: 'SCHEDULED' },
            homeScore: { type: 'integer', nullable: true, example: 27 },
            awayScore: { type: 'integer', nullable: true, example: 24 }
          }
        },
        Prediction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            userId: { type: 'integer', example: 1 },
            gameId: { type: 'integer', example: 1 },
            predictedWinner: { type: 'string', example: 'KC' },
            predictedHomeScore: { type: 'integer', nullable: true, example: 27 },
            predictedAwayScore: { type: 'integer', nullable: true, example: 24 },
            notes: { type: 'string', nullable: true, example: 'Jogando em casa no Arrowhead!' },
            pointsEarned: { type: 'integer', nullable: true, example: 4 },
            outcomeStatus: {
              type: 'string',
              enum: ['PENDING', 'HIT', 'EXACT_HIT', 'MISS', 'NEUTRAL', 'SUSPENDED'],
              example: 'PENDING'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
