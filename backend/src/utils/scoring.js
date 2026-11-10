const { User, Game, Prediction } = require('../models');

/**
 * Calcula a pontuação de um palpite individual frente ao resultado final do jogo
 * - RN02: Acerto do vencedor = +1 ponto
 * - RN02.1: Erro na escolha do vencedor = -1 ponto
 * - RN03: Partida empatada = 0 pontos (NEUTRAL)
 * - RN06: Acerto exato do placar = +3 pontos adicionais
 * - RN07: Partida adiada/cancelada (POSTPONED) = suspenso (SUSPENDED, 0 pontos até confirmação)
 */
function evaluatePredictionOutcome(prediction, game) {
  if (!game || game.status === 'SCHEDULED') {
    return { pointsEarned: 0, outcomeStatus: 'PENDING' };
  }

  if (game.status === 'POSTPONED') {
    return { pointsEarned: 0, outcomeStatus: 'SUSPENDED' };
  }

  if (game.homeScore === null || game.awayScore === null) {
    return { pointsEarned: 0, outcomeStatus: 'PENDING' };
  }

  // RN03: Caso uma partida termine empatada, todos os palpites são computados como neutros (0 pontos)
  if (game.homeScore === game.awayScore) {
    return { pointsEarned: 0, outcomeStatus: 'NEUTRAL' };
  }

  const actualWinner = game.homeScore > game.awayScore ? game.homeTeamAbbr : game.awayTeamAbbr;
  const isWinnerCorrect = prediction.predictedWinner === actualWinner;

  const isExactScore =
    prediction.predictedHomeScore !== null &&
    prediction.predictedAwayScore !== null &&
    Number(prediction.predictedHomeScore) === Number(game.homeScore) &&
    Number(prediction.predictedAwayScore) === Number(game.awayScore);

  if (isWinnerCorrect) {
    // RN02 (+1 ponto) + RN06 (+3 pontos se acertar o placar exato)
    const points = isExactScore ? 4 : 1;
    const status = isExactScore ? 'EXACT_HIT' : 'HIT';
    return { pointsEarned: points, outcomeStatus: status };
  } else {
    // RN02.1: Cada erro na escolha do vencedor subtrairá 1 ponto
    return { pointsEarned: -1, outcomeStatus: 'MISS' };
  }
}

/**
 * Recalcula todos os palpites e atualiza o ranking de todos os usuários usando Promises encadeadas (RN11 e RN14)
 */
function recalculateAllScores() {
  return new Promise((resolve, reject) => {
    Prediction.findAll({
      include: [{ model: Game, as: 'game' }]
    })
      .then((predictions) => {
        const updatePromises = predictions.map((pred) => {
          const result = evaluatePredictionOutcome(pred, pred.game);
          return pred.update({
            pointsEarned: result.pointsEarned,
            outcomeStatus: result.outcomeStatus
          });
        });
        return Promise.all(updatePromises);
      })
      .then(() => {
        return User.findAll({
          include: [{ model: Prediction, as: 'predictions' }]
        });
      })
      .then((users) => {
        const userUpdates = users.map((user) => {
          let totalPoints = 0;
          let hits = 0;
          let misses = 0;
          let exactScores = 0;

          (user.predictions || []).forEach((pred) => {
            if (pred.outcomeStatus === 'HIT') {
              hits += 1;
              totalPoints += pred.pointsEarned;
            } else if (pred.outcomeStatus === 'EXACT_HIT') {
              hits += 1;
              exactScores += 1;
              totalPoints += pred.pointsEarned;
            } else if (pred.outcomeStatus === 'MISS') {
              misses += 1;
              totalPoints += pred.pointsEarned;
            }
          });

          return user.update({
            points: totalPoints,
            hits,
            misses,
            exactScores
          });
        });

        return Promise.all(userUpdates);
      })
      .then((updatedUsers) => {
        resolve(updatedUsers);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  evaluatePredictionOutcome,
  recalculateAllScores
};
