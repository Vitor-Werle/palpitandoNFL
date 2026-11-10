const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'O nome de usuário (username) já está em uso (RN16).'
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Este endereço de e-mail já está cadastrado na plataforma (RN17).'
      },
      validate: {
        isEmail: {
          msg: 'Informe um endereço de e-mail válido.'
        }
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: {
        len: [2, 2]
      }
    },
    favoriteTeam: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    hits: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    misses: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    exactScores: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    eligibleForRanking: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'RN15: Usuários cadastrados após o início da temporada podem palpitar, mas não entram no ranking oficial.'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'RN21: Validação de conta por código/link de ativação.'
    },
    verificationCode: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  },
  {
    tableName: 'users',
    timestamps: true
  }
);

module.exports = User;
