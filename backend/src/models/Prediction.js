const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prediction = sequelize.define(
  'Prediction',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    predictedWinner: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        notIn: {
          args: [['TIE', 'EMPATE', 'DRAW']],
          msg: 'RN04: O usuário deverá selecionar estritamente um time vencedor, sem opção de aposta em empate.'
        }
      }
    },
    predictedHomeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    predictedAwayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    outcomeStatus: {
      type: DataTypes.ENUM('PENDING', 'HIT', 'EXACT_HIT', 'MISS', 'NEUTRAL', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'PENDING'
    }
  },
  {
    tableName: 'predictions',
    timestamps: true
  }
);

module.exports = Prediction;
