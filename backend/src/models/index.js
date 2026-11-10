const { sequelize } = require('../config/database');
const User = require('./User');
const Game = require('./Game');
const Prediction = require('./Prediction');

// Relacionamentos 1:N (Um Usuário possui muitos Palpites; Um Jogo possui muitos Palpites)
User.hasMany(Prediction, { foreignKey: 'userId', as: 'predictions', onDelete: 'CASCADE' });
Prediction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Game.hasMany(Prediction, { foreignKey: 'gameId', as: 'predictions', onDelete: 'CASCADE' });
Prediction.belongsTo(Game, { foreignKey: 'gameId', as: 'game' });

module.exports = {
  sequelize,
  User,
  Game,
  Prediction
};
