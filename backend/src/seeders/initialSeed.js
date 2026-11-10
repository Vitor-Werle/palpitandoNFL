const bcrypt = require('bcryptjs');
const { User, Game, Prediction } = require('../models');
const { recalculateAllScores } = require('../utils/scoring');

/**
 * Popula o banco de dados PostgreSQL com dados iniciais da NFL caso esteja vazio,
 * utilizando Promises encadeadas.
 */
function seedInitialData() {
  return new Promise((resolve, reject) => {
    User.count()
      .then((userCount) => {
        if (userCount > 0) {
          console.log('ℹ️ Banco de dados já possui registros iniciais.');
          return resolve(false);
        }

        console.log('🌱 Semeando dados iniciais da NFL no PostgreSQL...');
        return bcrypt.hash('123456', 10);
      })
      .then((passwordHash) => {
        if (!passwordHash) return null;

        return User.bulkCreate(
          [
            {
              username: 'vitor_nfl',
              email: 'vitor@nfl.com',
              passwordHash,
              state: 'SP',
              favoriteTeam: 'KC',
              eligibleForRanking: true,
              isVerified: true,
              verificationCode: 'NFL-2026'
            },
            {
              username: 'ana_niners',
              email: 'ana@nfl.com',
              passwordHash,
              state: 'RJ',
              favoriteTeam: 'SF',
              eligibleForRanking: true,
              isVerified: true,
              verificationCode: 'NFL-4949'
            }
          ],
          { returning: true }
        );
      })
      .then((createdUsers) => {
        if (!createdUsers) return null;

        const now = Date.now();
        const pastGame1 = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const pastGame2 = new Date(now - 6 * 24 * 60 * 60 * 1000);
        const futureOpen1 = new Date(now + 48 * 60 * 60 * 1000);
        const futureOpen2 = new Date(now + 52 * 60 * 60 * 1000);
        const futureOpen3 = new Date(now + 72 * 60 * 60 * 1000);
        const lockedSoon = new Date(now + 60 * 60 * 1000);

        return Game.bulkCreate(
          [
            {
              week: 9,
              season: 2026,
              homeTeam: 'Kansas City Chiefs',
              homeTeamAbbr: 'KC',
              awayTeam: 'Baltimore Ravens',
              awayTeamAbbr: 'BAL',
              kickoffTime: pastGame1,
              stadium: 'Arrowhead Stadium - Kansas City, MO',
              injuryReport: 'KC: Elenco completo | BAL: Keaton Mitchell (Fora)',
              status: 'FINAL',
              homeScore: 27,
              awayScore: 20
            },
            {
              week: 9,
              season: 2026,
              homeTeam: 'San Francisco 49ers',
              homeTeamAbbr: 'SF',
              awayTeam: 'Dallas Cowboys',
              awayTeamAbbr: 'DAL',
              kickoffTime: pastGame2,
              stadium: "Levi's Stadium - Santa Clara, CA",
              injuryReport: 'SF: Christian McCaffrey (Ativo) | DAL: Trevon Diggs (Dúvida)',
              status: 'FINAL',
              homeScore: 30,
              awayScore: 24
            },
            {
              week: 10,
              season: 2026,
              homeTeam: 'Buffalo Bills',
              homeTeamAbbr: 'BUF',
              awayTeam: 'Kansas City Chiefs',
              awayTeamAbbr: 'KC',
              kickoffTime: futureOpen1,
              stadium: 'Highmark Stadium - Orchard Park, NY',
              injuryReport: 'BUF: Dalton Kincaid (Questionável) | KC: Rashee Rice (Fora)',
              status: 'SCHEDULED',
              homeScore: null,
              awayScore: null
            },
            {
              week: 10,
              season: 2026,
              homeTeam: 'Philadelphia Eagles',
              homeTeamAbbr: 'PHI',
              awayTeam: 'San Francisco 49ers',
              awayTeamAbbr: 'SF',
              kickoffTime: futureOpen2,
              stadium: 'Lincoln Financial Field - Philadelphia, PA',
              injuryReport: 'PHI: Lane Johnson (Provável) | SF: Deebo Samuel (Ativo)',
              status: 'SCHEDULED',
              homeScore: null,
              awayScore: null
            },
            {
              week: 10,
              season: 2026,
              homeTeam: 'Green Bay Packers',
              homeTeamAbbr: 'GB',
              awayTeam: 'Miami Dolphins',
              awayTeamAbbr: 'MIA',
              kickoffTime: futureOpen3,
              stadium: 'Lambeau Field - Green Bay, WI',
              injuryReport: 'GB: Jaire Alexander (Questionável) | MIA: Tua Tagovailoa (Ativo)',
              status: 'SCHEDULED',
              homeScore: null,
              awayScore: null
            },
            {
              week: 10,
              season: 2026,
              homeTeam: 'Cincinnati Bengals',
              homeTeamAbbr: 'CIN',
              awayTeam: 'Baltimore Ravens',
              awayTeamAbbr: 'BAL',
              kickoffTime: lockedSoon,
              stadium: 'Paycor Stadium - Cincinnati, OH',
              injuryReport: 'CIN: Tee Higgins (Dúvida) | BAL: Kyle Hamilton (Ativo)',
              status: 'SCHEDULED',
              homeScore: null,
              awayScore: null
            }
          ],
          { returning: true }
        ).then((createdGames) => ({ createdUsers, createdGames }));
      })
      .then((seedBundle) => {
        if (!seedBundle) return null;
        const { createdUsers, createdGames } = seedBundle;

        const [vitor, ana] = createdUsers;
        const [game1, game2, game3] = createdGames;

        return Prediction.bulkCreate([
          {
            userId: vitor.id,
            gameId: game1.id,
            predictedWinner: 'KC',
            predictedHomeScore: 27,
            predictedAwayScore: 20,
            notes: 'Mahomes garante em casa com placar cravado!'
          },
          {
            userId: vitor.id,
            gameId: game2.id,
            predictedWinner: 'SF',
            predictedHomeScore: 28,
            predictedAwayScore: 21,
            notes: '49ers dominam na Califórnia.'
          },
          {
            userId: ana.id,
            gameId: game1.id,
            predictedWinner: 'BAL',
            predictedHomeScore: 21,
            predictedAwayScore: 24,
            notes: 'Apostando no visitante.'
          },
          {
            userId: ana.id,
            gameId: game2.id,
            predictedWinner: 'SF',
            predictedHomeScore: 30,
            predictedAwayScore: 24,
            notes: 'Vitória dos 49ers em casa!'
          },
          {
            userId: vitor.id,
            gameId: game3.id,
            predictedWinner: 'KC',
            predictedHomeScore: 24,
            predictedAwayScore: 27,
            notes: 'Clássico da AFC!'
          },
          {
            userId: ana.id,
            gameId: game3.id,
            predictedWinner: 'BUF',
            predictedHomeScore: 28,
            predictedAwayScore: 24,
            notes: 'Josh Allen joga em casa.'
          }
        ]);
      })
      .then((createdPredictions) => {
        if (!createdPredictions) return resolve(false);
        return recalculateAllScores().then(() => {
          console.log('✅ Dados iniciais semeados e ranking calculado com sucesso!');
          resolve(true);
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao executar seed inicial:', error);
        reject(error);
      });
  });
}

module.exports = {
  seedInitialData
};
