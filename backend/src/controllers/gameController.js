const { Game, Prediction } = require('../models');
const { recalculateAllScores } = require('../utils/scoring');

/**
 * READ - Listar todos os jogos da NFL com cálculo de tendências/porcentagem de votos (REQ 006, REQ 011, REQ 018)
 */
exports.getAllGames = (req, res) => {
  const { week, season } = req.query;
  const whereClause = {};

  if (week) whereClause.week = Number(week);
  if (season) whereClause.season = Number(season);

  Game.findAll({
    where: whereClause,
    include: [{ model: Prediction, as: 'predictions' }],
    order: [
      ['week', 'ASC'],
      ['kickoffTime', 'ASC']
    ]
  })
    .then((games) => {
      const formattedGames = games.map((game) => {
        const plain = game.get({ plain: true });
        const preds = plain.predictions || [];
        const totalVotes = preds.length;
        const homeVotes = preds.filter((p) => p.predictedWinner === plain.homeTeamAbbr).length;
        const awayVotes = preds.filter((p) => p.predictedWinner === plain.awayTeamAbbr).length;

        const homePercentage = totalVotes > 0 ? Math.round((homeVotes / totalVotes) * 100) : 50;
        const awayPercentage = totalVotes > 0 ? 100 - homePercentage : 50;

        // Verifica bloqueio RN01/RN09 (2 horas antes do início)
        const now = new Date();
        const kickoff = new Date(plain.kickoffTime);
        const hoursUntilKickoff = (kickoff.getTime() - now.getTime()) / (1000 * 60 * 60);
        const isLocked = plain.status !== 'SCHEDULED' || hoursUntilKickoff < 2;

        return {
          ...plain,
          trends: {
            totalVotes,
            homeVotes,
            awayVotes,
            homePercentage,
            awayPercentage
          },
          isLocked,
          hoursUntilKickoff: Math.round(hoursUntilKickoff * 10) / 10
        };
      });

      res.status(200).json(formattedGames);
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao listar jogos da rodada.',
        error: error.message
      });
    });
};

/**
 * CREATE - Cadastrar novo jogo da NFL
 */
exports.createGame = (req, res) => {
  const {
    week,
    season,
    homeTeam,
    homeTeamAbbr,
    awayTeam,
    awayTeamAbbr,
    kickoffTime,
    stadium,
    injuryReport,
    status,
    homeScore,
    awayScore
  } = req.body;

  if (!homeTeam || !homeTeamAbbr || !awayTeam || !awayTeamAbbr || !kickoffTime) {
    return res.status(400).json({
      message: 'Informe time da casa, visitante, siglas e data/hora do jogo.'
    });
  }

  Game.create({
    week: week ? Number(week) : 10,
    season: season ? Number(season) : 2026,
    homeTeam,
    homeTeamAbbr: homeTeamAbbr.toUpperCase(),
    awayTeam,
    awayTeamAbbr: awayTeamAbbr.toUpperCase(),
    kickoffTime,
    stadium: stadium || 'NFL Stadium',
    injuryReport: injuryReport || 'Sem desfalques reportados no boletim médico.',
    status: status || 'SCHEDULED',
    homeScore: homeScore !== undefined && homeScore !== '' ? Number(homeScore) : null,
    awayScore: awayScore !== undefined && awayScore !== '' ? Number(awayScore) : null
  })
    .then((createdGame) => {
      return recalculateAllScores().then(() => createdGame);
    })
    .then((game) => {
      res.status(201).json({
        message: 'Partida cadastrada com sucesso!',
        game
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao cadastrar partida.',
        error: error.message
      });
    });
};

/**
 * UPDATE - Atualizar placar, status ou horário de uma partida e recalcular automaticamente o Ranking (RN14)
 */
exports.updateGame = (req, res) => {
  const { id } = req.params;
  const {
    week,
    homeTeam,
    homeTeamAbbr,
    awayTeam,
    awayTeamAbbr,
    kickoffTime,
    stadium,
    injuryReport,
    status,
    homeScore,
    awayScore
  } = req.body;

  Game.findByPk(id)
    .then((game) => {
      if (!game) {
        const err = new Error('Partida não encontrada.');
        err.statusCode = 404;
        throw err;
      }

      return game.update({
        week: week !== undefined ? Number(week) : game.week,
        homeTeam: homeTeam !== undefined ? homeTeam : game.homeTeam,
        homeTeamAbbr: homeTeamAbbr !== undefined ? homeTeamAbbr.toUpperCase() : game.homeTeamAbbr,
        awayTeam: awayTeam !== undefined ? awayTeam : game.awayTeam,
        awayTeamAbbr: awayTeamAbbr !== undefined ? awayTeamAbbr.toUpperCase() : game.awayTeamAbbr,
        kickoffTime: kickoffTime !== undefined ? kickoffTime : game.kickoffTime,
        stadium: stadium !== undefined ? stadium : game.stadium,
        injuryReport: injuryReport !== undefined ? injuryReport : game.injuryReport,
        status: status !== undefined ? status : game.status,
        homeScore:
          homeScore !== undefined
            ? homeScore === '' || homeScore === null
              ? null
              : Number(homeScore)
            : game.homeScore,
        awayScore:
          awayScore !== undefined
            ? awayScore === '' || awayScore === null
              ? null
              : Number(awayScore)
            : game.awayScore
      });
    })
    .then((updatedGame) => {
      return recalculateAllScores().then(() => updatedGame);
    })
    .then((updatedGame) => {
      res.status(200).json({
        message: 'Partida atualizada e pontuação do ranking recalculada automaticamente (RN14)!',
        game: updatedGame
      });
    })
    .catch((error) => {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        message: error.message || 'Erro ao atualizar partida.',
        error: error.message
      });
    });
};

/**
 * DELETE - Excluir uma partida e recalcular pontos
 */
exports.deleteGame = (req, res) => {
  const { id } = req.params;

  Game.findByPk(id)
    .then((game) => {
      if (!game) {
        const err = new Error('Partida não encontrada.');
        err.statusCode = 404;
        throw err;
      }
      return game.destroy();
    })
    .then(() => {
      return recalculateAllScores();
    })
    .then(() => {
      res.status(200).json({ message: 'Partida excluída com sucesso!' });
    })
    .catch((error) => {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        message: error.message || 'Erro ao excluir partida.',
        error: error.message
      });
    });
};

/**
 * SYNC - Simula ou consome dados de calendário da API Esportiva da NFL (REQ 007)
 */
exports.syncGamesFromNflApi = (req, res) => {
  const futureDate1 = new Date(Date.now() + 72 * 60 * 60 * 1000); // Daqui a 3 dias
  const futureDate2 = new Date(Date.now() + 96 * 60 * 60 * 1000); // Daqui a 4 dias

  const externalNflFeed = [
    {
      week: 10,
      season: 2026,
      homeTeam: 'Detroit Lions',
      homeTeamAbbr: 'DET',
      awayTeam: 'Green Bay Packers',
      awayTeamAbbr: 'GB',
      kickoffTime: futureDate1,
      stadium: 'Ford Field - Detroit, MI',
      injuryReport: 'DET: Aidan Hutchinson (Fora) | GB: Jordan Love (Provável)',
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null
    },
    {
      week: 10,
      season: 2026,
      homeTeam: 'Dallas Cowboys',
      homeTeamAbbr: 'DAL',
      awayTeam: 'Philadelphia Eagles',
      awayTeamAbbr: 'PHI',
      kickoffTime: futureDate2,
      stadium: 'AT&T Stadium - Arlington, TX',
      injuryReport: 'DAL: Micah Parsons (Provável) | PHI: A.J. Brown (Ativo)',
      status: 'SCHEDULED',
      homeScore: null,
      awayScore: null
    }
  ];

  Promise.all(
    externalNflFeed.map((item) =>
      Game.findOrCreate({
        where: {
          week: item.week,
          homeTeamAbbr: item.homeTeamAbbr,
          awayTeamAbbr: item.awayTeamAbbr
        },
        defaults: item
      })
    )
  )
    .then((results) => {
      const createdCount = results.filter(([, created]) => created).length;
      res.status(200).json({
        message: `Sincronização com a API da NFL concluída (REQ 007)! ${createdCount} novo(s) confronto(s) adicionado(s).`,
        createdCount
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: 'Erro ao sincronizar jogos da NFL.',
        error: error.message
      });
    });
};
