const { Prediction, Game, User } = require('../models');
const { evaluatePredictionOutcome, recalculateAllScores } = require('../utils/scoring');

function isGameLockedForPredictions(kickoffTime, status) {
  if (status && status !== 'SCHEDULED') {
    return true;
  }
  const now = new Date();
  const gameStart = new Date(kickoffTime);
  const diffInHours = (gameStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffInHours < 2;
}

/**
 * Valida se o placar informado é coerente com o time vencedor selecionado:
 * Os pontos do time vencedor devem ser maiores que os pontos do time perdedor.
 */
function validateWinnerScoreConsistency(predictedWinner, homeScoreVal, awayScoreVal, game) {
  const hasHome = homeScoreVal !== null && homeScoreVal !== undefined;
  const hasAway = awayScoreVal !== null && awayScoreVal !== undefined;

  if (!hasHome && !hasAway) {
    return null;
  }

  if (hasHome !== hasAway) {
    return 'Informe o placar dos dois times ou deixe ambos os campos em branco.';
  }

  if (predictedWinner === game.homeTeamAbbr && homeScoreVal <= awayScoreVal) {
    return `Os pontos do vencedor (${game.homeTeamAbbr}) devem ser maiores que os do perdedor (${game.awayTeamAbbr}).`;
  }

  if (predictedWinner === game.awayTeamAbbr && awayScoreVal <= homeScoreVal) {
    return `Os pontos do vencedor (${game.awayTeamAbbr}) devem ser maiores que os do perdedor (${game.homeTeamAbbr}).`;
  }

  return null;
}

exports.getAllPredictions = (req, res) => {
  const { userId, gameId, week } = req.query;
  const whereClause = {};

  if (userId) whereClause.userId = Number(userId);
  if (gameId) whereClause.gameId = Number(gameId);

  const gameWhere = {};
  if (week) gameWhere.week = Number(week);

  Prediction.findAll({
    where: whereClause,
    include: [
      {
        model: Game,
        as: 'game',
        where: Object.keys(gameWhere).length > 0 ? gameWhere : undefined
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'state', 'favoriteTeam']
      }
    ],
    order: [['createdAt', 'DESC']]
  })
    .then((predictions) => {
      res.status(200).json(predictions);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao consultar palpites no banco de dados.',
        error: error.message
      });
    });
};

exports.getPredictionById = (req, res) => {
  const { id } = req.params;

  Prediction.findByPk(id, {
    include: [
      { model: Game, as: 'game' },
      { model: User, as: 'user', attributes: ['id', 'username', 'state', 'favoriteTeam'] }
    ]
  })
    .then((prediction) => {
      if (!prediction) {
        return res.status(404).json({ message: 'Palpite não encontrado.' });
      }
      return res.status(200).json(prediction);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao buscar palpite.',
        error: error.message
      });
    });
};

exports.createPrediction = (req, res) => {
  const { userId, gameId, predictedWinner, predictedHomeScore, predictedAwayScore, notes } = req.body;

  if (!userId || !gameId || !predictedWinner) {
    return res.status(400).json({
      message: 'Selecione a partida e o time vencedor.'
    });
  }

  if (['TIE', 'EMPATE', 'DRAW'].includes(String(predictedWinner).toUpperCase())) {
    return res.status(400).json({
      message: 'Selecione estritamente um time vencedor, sem opção de aposta em empate.'
    });
  }

  const homeScoreVal =
    predictedHomeScore !== undefined && predictedHomeScore !== '' && predictedHomeScore !== null
      ? Number(predictedHomeScore)
      : null;
  const awayScoreVal =
    predictedAwayScore !== undefined && predictedAwayScore !== '' && predictedAwayScore !== null
      ? Number(predictedAwayScore)
      : null;

  let targetGame = null;

  Game.findByPk(gameId)
    .then((game) => {
      if (!game) {
        const err = new Error('Partida não encontrada.');
        err.statusCode = 404;
        throw err;
      }
      targetGame = game;

      if (predictedWinner !== game.homeTeamAbbr && predictedWinner !== game.awayTeamAbbr) {
        const err = new Error(
          `O time vencedor escolhido (${predictedWinner}) deve ser ${game.homeTeamAbbr} ou ${game.awayTeamAbbr}.`
        );
        err.statusCode = 400;
        throw err;
      }

      if (isGameLockedForPredictions(game.kickoffTime, game.status)) {
        const err = new Error(
          'Não é permitido registrar palpites com menos de 2 horas para o início da partida ou após seu encerramento.'
        );
        err.statusCode = 400;
        throw err;
      }

      const scoreError = validateWinnerScoreConsistency(
        predictedWinner,
        homeScoreVal,
        awayScoreVal,
        game
      );
      if (scoreError) {
        const err = new Error(scoreError);
        err.statusCode = 400;
        throw err;
      }

      return Prediction.findOne({
        where: {
          userId: Number(userId),
          gameId: Number(gameId)
        }
      });
    })
    .then((existingPrediction) => {
      if (existingPrediction) {
        const err = new Error('Você já realizou um palpite para esta partida.');
        err.statusCode = 409;
        throw err;
      }

      const outcome = evaluatePredictionOutcome(
        {
          predictedWinner,
          predictedHomeScore: homeScoreVal,
          predictedAwayScore: awayScoreVal
        },
        targetGame
      );

      return Prediction.create({
        userId: Number(userId),
        gameId: Number(gameId),
        predictedWinner,
        predictedHomeScore: homeScoreVal,
        predictedAwayScore: awayScoreVal,
        notes: notes || null,
        pointsEarned: outcome.pointsEarned,
        outcomeStatus: outcome.outcomeStatus
      });
    })
    .then((createdPrediction) => {
      return recalculateAllScores().then(() =>
        Prediction.findByPk(createdPrediction.id, {
          include: [
            { model: Game, as: 'game' },
            { model: User, as: 'user', attributes: ['id', 'username', 'state', 'favoriteTeam'] }
          ]
        })
      );
    })
    .then((fullPrediction) => {
      res.status(201).json({
        message: 'Palpite cadastrado com sucesso!',
        prediction: fullPrediction
      });
    })
    .catch((error) => {
      const status = error.statusCode || 500;
      res.status(status).json({
        message: error.message || 'Erro ao cadastrar palpite.',
        error: error.message
      });
    });
};

exports.updatePrediction = (req, res) => {
  const { id } = req.params;
  const { userId, predictedWinner, predictedHomeScore, predictedAwayScore, notes } = req.body;

  Prediction.findByPk(id, {
    include: [{ model: Game, as: 'game' }]
  })
    .then((prediction) => {
      if (!prediction) {
        const err = new Error('Palpite não encontrado para atualização.');
        err.statusCode = 404;
        throw err;
      }

      // Garante que uma conta não altere palpites de outra conta
      if (userId && Number(userId) !== Number(prediction.userId)) {
        const err = new Error('Você só pode editar os seus próprios palpites.');
        err.statusCode = 403;
        throw err;
      }

      if (
        prediction.game &&
        isGameLockedForPredictions(prediction.game.kickoffTime, prediction.game.status)
      ) {
        const err = new Error(
          'Edição bloqueada! Faltam menos de 2 horas para o início do jogo ou a partida já foi encerrada.'
        );
        err.statusCode = 400;
        throw err;
      }

      const nextWinner = predictedWinner || prediction.predictedWinner;
      if (['TIE', 'EMPATE', 'DRAW'].includes(String(nextWinner).toUpperCase())) {
        const err = new Error('Não é permitido apostar em empate.');
        err.statusCode = 400;
        throw err;
      }

      if (
        prediction.game &&
        nextWinner !== prediction.game.homeTeamAbbr &&
        nextWinner !== prediction.game.awayTeamAbbr
      ) {
        const err = new Error(
          `O vencedor deve ser ${prediction.game.homeTeamAbbr} ou ${prediction.game.awayTeamAbbr}.`
        );
        err.statusCode = 400;
        throw err;
      }

      const homeScoreVal =
        predictedHomeScore !== undefined
          ? predictedHomeScore === '' || predictedHomeScore === null
            ? null
            : Number(predictedHomeScore)
          : prediction.predictedHomeScore;

      const awayScoreVal =
        predictedAwayScore !== undefined
          ? predictedAwayScore === '' || predictedAwayScore === null
            ? null
            : Number(predictedAwayScore)
          : prediction.predictedAwayScore;

      if (prediction.game) {
        const scoreError = validateWinnerScoreConsistency(
          nextWinner,
          homeScoreVal,
          awayScoreVal,
          prediction.game
        );
        if (scoreError) {
          const err = new Error(scoreError);
          err.statusCode = 400;
          throw err;
        }
      }

      const outcome = evaluatePredictionOutcome(
        {
          predictedWinner: nextWinner,
          predictedHomeScore: homeScoreVal,
          predictedAwayScore: awayScoreVal
        },
        prediction.game
      );

      return prediction.update({
        predictedWinner: nextWinner,
        predictedHomeScore: homeScoreVal,
        predictedAwayScore: awayScoreVal,
        notes: notes !== undefined ? notes : prediction.notes,
        pointsEarned: outcome.pointsEarned,
        outcomeStatus: outcome.outcomeStatus
      });
    })
    .then((updated) => {
      return recalculateAllScores().then(() =>
        Prediction.findByPk(updated.id, {
          include: [
            { model: Game, as: 'game' },
            { model: User, as: 'user', attributes: ['id', 'username', 'state', 'favoriteTeam'] }
          ]
        })
      );
    })
    .then((reloadedPrediction) => {
      res.status(200).json({
        message: 'Palpite atualizado com sucesso!',
        prediction: reloadedPrediction
      });
    })
    .catch((error) => {
      const status = error.statusCode || 500;
      res.status(status).json({
        message: error.message || 'Erro ao atualizar palpite.',
        error: error.message
      });
    });
};

exports.deletePrediction = (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  Prediction.findByPk(id)
    .then((prediction) => {
      if (!prediction) {
        const err = new Error('Palpite não encontrado para exclusão.');
        err.statusCode = 404;
        throw err;
      }

      // Garante que uma conta não exclua palpites de outra conta
      if (userId && Number(userId) !== Number(prediction.userId)) {
        const err = new Error('Você só pode excluir os seus próprios palpites.');
        err.statusCode = 403;
        throw err;
      }

      return prediction.destroy();
    })
    .then(() => {
      return recalculateAllScores();
    })
    .then(() => {
      res.status(200).json({
        message: 'Palpite excluído com sucesso!'
      });
    })
    .catch((error) => {
      const status = error.statusCode || 500;
      res.status(status).json({
        message: error.message || 'Erro ao excluir palpite.',
        error: error.message
      });
    });
};
