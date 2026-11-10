import React, { useState, useRef } from 'react';
import { NFL_TEAMS } from '../utils/nflConstants';

export default function GamesRoundPage({
  games,
  onSyncNflGames,
  onCreateGame,
  onUpdateGame,
  onDeleteGame
}) {
  const [selectedWeek, setSelectedWeek] = useState('ALL');

  const [week, setWeek] = useState(10);
  const [awayTeamAbbr, setAwayTeamAbbr] = useState('MIA');
  const [homeTeamAbbr, setHomeTeamAbbr] = useState('NYJ');
  const [stadium, setStadium] = useState('MetLife Stadium - East Rutherford, NJ');
  const [injuryReport, setInjuryReport] = useState('MIA: Sem baixas | NYJ: Aaron Rodgers (Provável)');
  const [hoursFromNow, setHoursFromNow] = useState(48);

  const scoreDialogRef = useRef(null);
  const [targetGame, setTargetGame] = useState(null);
  const [modalStatus, setModalStatus] = useState('FINAL');
  const [modalAwayScore, setModalAwayScore] = useState('21');
  const [modalHomeScore, setModalHomeScore] = useState('24');

  const handleCreateGameSubmit = (e) => {
    e.preventDefault();
    const awayObj = NFL_TEAMS.find((t) => t.abbr === awayTeamAbbr) || {
      abbr: awayTeamAbbr,
      name: awayTeamAbbr
    };
    const homeObj = NFL_TEAMS.find((t) => t.abbr === homeTeamAbbr) || {
      abbr: homeTeamAbbr,
      name: homeTeamAbbr
    };

    const kickoff = new Date(Date.now() + Number(hoursFromNow) * 60 * 60 * 1000);

    onCreateGame({
      week: Number(week),
      season: 2026,
      awayTeam: awayObj.name,
      awayTeamAbbr: awayObj.abbr,
      homeTeam: homeObj.name,
      homeTeamAbbr: homeObj.abbr,
      kickoffTime: kickoff.toISOString(),
      stadium,
      injuryReport,
      status: 'SCHEDULED'
    });
  };

  const openScoreModal = (game) => {
    setTargetGame(game);
    setModalStatus(game.status === 'SCHEDULED' ? 'FINAL' : game.status);
    setModalAwayScore(game.awayScore !== null ? String(game.awayScore) : '24');
    setModalHomeScore(game.homeScore !== null ? String(game.homeScore) : '27');
    if (scoreDialogRef.current) {
      scoreDialogRef.current.showModal();
    }
  };

  const closeScoreModal = () => {
    if (scoreDialogRef.current) {
      scoreDialogRef.current.close();
      scoreDialogRef.current.returnValue = '';
    }
    setTargetGame(null);
  };

  const handleSaveOfficialResult = (e) => {
    e.preventDefault();
    if (!targetGame) return;

    onUpdateGame(targetGame.id, {
      status: modalStatus,
      awayScore: modalStatus === 'FINAL' ? Number(modalAwayScore) : null,
      homeScore: modalStatus === 'FINAL' ? Number(modalHomeScore) : null
    }).then((ok) => {
      if (ok) closeScoreModal();
    });
  };

  const filteredGames = games.filter((g) =>
    selectedWeek === 'ALL' ? true : String(g.week) === selectedWeek
  );

  return (
    <div className="page-container">
      <div className="page-header-bar">
        <div>
          <h2 className="section-title">Jogos da Rodada</h2>
          <p className="muted-text">
            Calendário de confrontos, tendência da comunidade e atualização de resultados.
          </p>
        </div>
        <div className="filter-bar">
          <select
            aria-label="Filtrar semana dos jogos"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="ALL">Todas as Semanas</option>
            <option value="9">Semana 9</option>
            <option value="10">Semana 10</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={onSyncNflGames}>
            Sincronizar Jogos da NFL
          </button>
        </div>
      </div>

      <div className="games-grid">
        {filteredGames.map((game) => {
          const trends = game.trends || {
            totalVotes: 0,
            awayPercentage: 50,
            homePercentage: 50,
            awayVotes: 0,
            homeVotes: 0
          };

          return (
            <article key={game.id} className="card game-card">
              <div className="game-card-top">
                <span className="week-tag">
                  Semana {game.week} • {game.season}
                </span>
                <span
                  className={`status-pill ${
                    game.status === 'FINAL'
                      ? 'status-final'
                      : game.isLocked
                      ? 'status-locked'
                      : 'status-open'
                  }`}
                >
                  {game.status === 'FINAL'
                    ? 'Encerrado'
                    : game.status === 'POSTPONED'
                    ? 'Adiado'
                    : game.isLocked
                    ? 'Fechado'
                    : 'Aberto'}
                </span>
              </div>

              <div className="matchup-box">
                <div className="team-side">
                  <span className="team-badge">{game.awayTeamAbbr}</span>
                  <h4>{game.awayTeam}</h4>
                  <small>Visitante</small>
                  {game.status === 'FINAL' && (
                    <span className="official-score">{game.awayScore}</span>
                  )}
                </div>

                <div className="vs-divider">@</div>

                <div className="team-side">
                  <span className="team-badge home">{game.homeTeamAbbr}</span>
                  <h4>{game.homeTeam}</h4>
                  <small>Casa</small>
                  {game.status === 'FINAL' && (
                    <span className="official-score">{game.homeScore}</span>
                  )}
                </div>
              </div>

              <div className="trend-section">
                <div className="trend-labels">
                  <span>
                    {game.awayTeamAbbr}: {trends.awayPercentage}% ({trends.awayVotes})
                  </span>
                  <span>Tendência de Votos</span>
                  <span>
                    {game.homeTeamAbbr}: {trends.homePercentage}% ({trends.homeVotes})
                  </span>
                </div>
                <div className="trend-bar">
                  <div
                    className="trend-fill-away"
                    style={{ width: `${trends.awayPercentage}%` }}
                  />
                  <div
                    className="trend-fill-home"
                    style={{ width: `${trends.homePercentage}%` }}
                  />
                </div>
              </div>

              <div className="game-meta">
                <p>
                  <strong>Horário:</strong> {new Date(game.kickoffTime).toLocaleString('pt-BR')}
                </p>
                <p>
                  <strong>Estádio:</strong> {game.stadium}
                </p>
                <p>
                  <strong>Boletim Médico:</strong> {game.injuryReport}
                </p>
              </div>

              <div className="game-card-actions">
                <button
                  type="button"
                  className="btn btn-edit btn-sm"
                  onClick={() => openScoreModal(game)}
                >
                  Definir Resultado
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDeleteGame(game.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="card">
        <h3 className="section-title">Adicionar Nova Partida</h3>
        <form onSubmit={handleCreateGameSubmit} className="crud-form">
          <div className="form-row-4">
            <div className="form-group">
              <label htmlFor="game-week">Semana</label>
              <input
                id="game-week"
                type="number"
                min="1"
                max="18"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="game-away">Visitante</label>
              <select
                id="game-away"
                value={awayTeamAbbr}
                onChange={(e) => setAwayTeamAbbr(e.target.value)}
              >
                {NFL_TEAMS.map((t) => (
                  <option key={t.abbr} value={t.abbr}>
                    {t.abbr} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="game-home">Casa</label>
              <select
                id="game-home"
                value={homeTeamAbbr}
                onChange={(e) => setHomeTeamAbbr(e.target.value)}
              >
                {NFL_TEAMS.map((t) => (
                  <option key={t.abbr} value={t.abbr}>
                    {t.abbr} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="game-hours">Início em (horas)</label>
              <input
                id="game-hours"
                type="number"
                value={hoursFromNow}
                onChange={(e) => setHoursFromNow(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="game-stadium">Estádio</label>
              <input
                id="game-stadium"
                type="text"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="game-injury">Boletim Médico</label>
              <input
                id="game-injury"
                type="text"
                value={injuryReport}
                onChange={(e) => setInjuryReport(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <button type="submit" className="btn btn-primary">
              Adicionar Partida
            </button>
          </div>
        </form>
      </section>

      <dialog ref={scoreDialogRef} aria-labelledby="score-dialog-title" className="app-dialog">
        <h3 id="score-dialog-title">Resultado da Partida</h3>
        {targetGame && (
          <form onSubmit={handleSaveOfficialResult} className="crud-form">
            <p className="dialog-subtitle">
              {targetGame.awayTeam} ({targetGame.awayTeamAbbr}) @ {targetGame.homeTeam} (
              {targetGame.homeTeamAbbr})
            </p>

            <div className="form-group">
              <label htmlFor="modal-game-status">Status</label>
              <select
                id="modal-game-status"
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
              >
                <option value="FINAL">Encerrado (Final)</option>
                <option value="SCHEDULED">Agendado</option>
                <option value="POSTPONED">Adiado</option>
              </select>
            </div>

            {modalStatus === 'FINAL' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-away-score">
                    Placar {targetGame.awayTeamAbbr}
                  </label>
                  <input
                    id="modal-away-score"
                    type="number"
                    min="0"
                    max="99"
                    value={modalAwayScore}
                    onChange={(e) => setModalAwayScore(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-home-score">
                    Placar {targetGame.homeTeamAbbr}
                  </label>
                  <input
                    id="modal-home-score"
                    type="number"
                    min="0"
                    max="99"
                    value={modalHomeScore}
                    onChange={(e) => setModalHomeScore(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="dialog-actions">
              <button type="button" className="btn btn-outline" onClick={closeScoreModal}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Resultado
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
