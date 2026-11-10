const bcrypt = require('bcryptjs');
const { User, Prediction, Game } = require('../models');

/**
 * READ - Listar todos os usuários cadastrados
 */
exports.getAllUsers = (req, res) => {
  User.findAll({
    attributes: { exclude: ['passwordHash'] },
    order: [
      ['points', 'DESC'],
      ['exactScores', 'DESC'],
      ['hits', 'DESC'],
      ['username', 'ASC']
    ]
  })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao listar usuários.',
        error: error.message
      });
    });
};

/**
 * RANKING - Classificação dos 100 usuários com maior pontuação acumulada e filtros por UF e Time (RN11 a RN15, REQ 014)
 */
exports.getRanking = (req, res) => {
  const { state, favoriteTeam, includeIneligible } = req.query;
  const whereClause = {};

  // RN15: Por padrão exibe apenas os elegíveis para o ranking oficial da temporada
  if (includeIneligible !== 'true') {
    whereClause.eligibleForRanking = true;
  }

  if (state && state !== 'ALL') {
    whereClause.state = state.toUpperCase();
  }

  if (favoriteTeam && favoriteTeam !== 'ALL') {
    whereClause.favoriteTeam = favoriteTeam;
  }

  User.findAll({
    where: whereClause,
    attributes: { exclude: ['passwordHash'] },
    order: [
      ['points', 'DESC'],
      ['exactScores', 'DESC'],
      ['hits', 'DESC'],
      ['username', 'ASC']
    ],
    limit: 100 // RN12: Apresenta os 100 melhores colocados
  })
    .then((ranking) => {
      res.status(200).json(ranking);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao consultar ranking de usuários.',
        error: error.message
      });
    });
};

/**
 * CREATE - Cadastro de novo usuário (REQ 002, RN16, RN17, RN20, RN21, RN22, RNF 004)
 */
exports.registerUser = (req, res) => {
  const { username, email, password, state, favoriteTeam, eligibleForRanking } = req.body;

  if (!username || !email || !password || !state || !favoriteTeam) {
    return res.status(400).json({
      message: 'RN22: São campos obrigatórios: nome de usuário, e-mail, senha, estado (UF) e time favorito da NFL.'
    });
  }

  bcrypt
    .hash(password, 10)
    .then((passwordHash) => {
      const verificationCode = 'NFL-' + Math.floor(1000 + Math.random() * 9000);
      return User.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        state: state.toUpperCase(),
        favoriteTeam,
        eligibleForRanking: eligibleForRanking !== undefined ? Boolean(eligibleForRanking) : true,
        isVerified: true,
        verificationCode
      });
    })
    .then((newUser) => {
      const plain = newUser.get({ plain: true });
      delete plain.passwordHash;
      res.status(201).json({
        message: `Usuário cadastrado com sucesso! Código de validação gerado (RN21): ${plain.verificationCode}`,
        user: plain
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: error.errors ? error.errors[0].message : error.message,
        error: error.message
      });
    });
};

/**
 * LOGIN - Autenticação com e-mail e senha (REQ 001, RN20)
 */
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Informe e-mail e senha para autenticar.'
    });
  }

  let foundUser = null;

  User.findOne({ where: { email: email.trim().toLowerCase() } })
    .then((user) => {
      if (!user) {
        const err = new Error('Credenciais inválidas: e-mail não encontrado.');
        err.statusCode = 401;
        throw err;
      }
      foundUser = user;
      return bcrypt.compare(password, user.passwordHash);
    })
    .then((isMatch) => {
      if (!isMatch) {
        const err = new Error('Credenciais inválidas: senha incorreta.');
        err.statusCode = 401;
        throw err;
      }

      const plain = foundUser.get({ plain: true });
      delete plain.passwordHash;

      res.status(200).json({
        message: 'Login realizado com sucesso!',
        user: plain
      });
    })
    .catch((error) => {
      const status = error.statusCode || 500;
      res.status(status).json({
        message: error.message || 'Erro ao realizar login.',
        error: error.message
      });
    });
};

/**
 * UPDATE - Atualizar dados cadastrais do perfil do usuário (REQ 017)
 */
exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, state, favoriteTeam, eligibleForRanking } = req.body;

  User.findByPk(id)
    .then((user) => {
      if (!user) {
        const err = new Error('Usuário não encontrado.');
        err.statusCode = 404;
        throw err;
      }

      return user.update({
        username: username !== undefined ? username.trim() : user.username,
        state: state !== undefined ? state.toUpperCase() : user.state,
        favoriteTeam: favoriteTeam !== undefined ? favoriteTeam : user.favoriteTeam,
        eligibleForRanking:
          eligibleForRanking !== undefined ? Boolean(eligibleForRanking) : user.eligibleForRanking
      });
    })
    .then((updatedUser) => {
      const plain = updatedUser.get({ plain: true });
      delete plain.passwordHash;
      res.status(200).json({
        message: 'Perfil atualizado com sucesso (REQ 017)!',
        user: plain
      });
    })
    .catch((error) => {
      const status = error.statusCode || 400;
      res.status(status).json({
        message: error.errors ? error.errors[0].message : error.message,
        error: error.message
      });
    });
};

/**
 * DELETE - Excluir conta de usuário em conformidade com a LGPD (RNF 005)
 */
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  User.findByPk(id)
    .then((user) => {
      if (!user) {
        const err = new Error('Usuário não encontrado.');
        err.statusCode = 404;
        throw err;
      }
      return user.destroy();
    })
    .then(() => {
      res.status(200).json({
        message: 'Conta e palpites vinculados excluídos com sucesso (Conformidade LGPD - RNF 005).'
      });
    })
    .catch((error) => {
      const status = error.statusCode || 500;
      res.status(status).json({
        message: error.message || 'Erro ao excluir usuário.',
        error: error.message
      });
    });
};

/**
 * STATS - Painel de estatísticas consolidadas do usuário (RN18 e REQ 015)
 */
exports.getUserStats = (req, res) => {
  const { id } = req.params;

  User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
    include: [
      {
        model: Prediction,
        as: 'predictions',
        include: [{ model: Game, as: 'game' }]
      }
    ]
  })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      const predictions = user.predictions || [];
      const totalPredictions = predictions.length;
      const evaluatedPredictions = predictions.filter((p) =>
        ['HIT', 'EXACT_HIT', 'MISS', 'NEUTRAL'].includes(p.outcomeStatus)
      ).length;
      const totalHits = user.hits || 0;
      const winRate =
        evaluatedPredictions > 0 ? Math.round((totalHits / evaluatedPredictions) * 100) : 0;

      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          state: user.state,
          favoriteTeam: user.favoriteTeam,
          points: user.points,
          hits: user.hits,
          misses: user.misses,
          exactScores: user.exactScores,
          eligibleForRanking: user.eligibleForRanking
        },
        metrics: {
          totalPredictions,
          evaluatedPredictions,
          pendingPredictions: totalPredictions - evaluatedPredictions,
          winRatePercentage: winRate
        }
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao calcular estatísticas do usuário.',
        error: error.message
      });
    });
};
