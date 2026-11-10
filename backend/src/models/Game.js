const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Game = sequelize.define(
  'Game',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    season: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2026
    },
    homeTeam: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    homeTeamAbbr: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    awayTeam: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    awayTeamAbbr: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    kickoffTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    stadium: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'NFL Stadium'
    },
    injuryReport: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: 'Sem desfalques confirmados até o momento.'
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'FINAL', 'POSTPONED'),
      allowNull: false,
      defaultValue: 'SCHEDULED'
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'games',
    timestamps: true
  }
);

module.exports = Game;
