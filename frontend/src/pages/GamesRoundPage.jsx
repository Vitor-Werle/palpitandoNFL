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

  // Formulário para criar novo jogo de teste
  const [week, setWeek] = useState(10);
  const [awayTeamAbbr, setAwayTeamAbbr] = useState('MIA');
  const [homeTeamAbbr, setHomeTeamAbbr] = useState('NYJ');
  const [stadium, setStadium] = useState('MetLife Stadium - East Rutherford, NJ');
  const [injuryReport, setInjuryReport] = useState('MIA: Sem baixas | NYJ: Aaron Rodgers (Provável)');
  const [hoursFromNow, setHoursFromNow] = useState(48);

  // Modal de finalização/edição de placar oficial (RN14)
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
      <section className="eval-banner">
        <div>
          <h2>Jogos da Rodada da NFL, Tendências & Homologação de Resultados</h2>
          <p>
            Exibição com fuso horário local (REQ 006), sincronização com API esportiva (REQ 007),
            porcentagem de votos da comunidade (REQ 011), estádio e boletim médico (REQ 018).
          </p>
        </div>
        <div className="header-btn-group">
          <select
            aria-label="Filtrar semana dos jogos"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="week-select"
          >
            <option value="ALL">Todas as Semanas</option>
            <option value="9">Semana 9 (Finalizada)</option>
            <option value="10">Semana 10 (Atual)</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={onSyncNflGames}>
            🔄 Sincronizar Jogos via API NFL (REQ 007)
          </button>
        </div>
      </section>

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
                  Semana {game.week} • Temporada {game.season}
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
                    ? '🏁 ENCERRADO'
                    : game.status === 'POSTPONED'
                    ? '⏸️ ADIADO (RN07)'
                    : game.isLocked
                    ? '🔒 BLOQUEADO (< 2h - RN01)'
                    : '🟢 ABERTO PARA PALPITES'}
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

              {/* Barra de Tendência da Comunidade (REQ 011) */}
              <div className="trend-section">
                <div className="trend-labels">
                  <span>
                    {game.awayTeamAbbr}: {trends.awayPercentage}% ({trends.awayVotes} voto(s))
                  </span>
                  <span>Tendência da Comunidade (REQ 011)</span>
                  <span>
                    {game.homeTeamAbbr}: {trends.homePercentage}% ({trends.homeVotes} voto(s))
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
                  <strong>🕒 Início (Fuso Local):</strong>{' '}
                  {new Date(game.kickoffTime).toLocaleString('pt-BR')}
                </p>
                <p>
                  <strong>🏟️ Estádio:</strong> {game.stadium}
                </p>
                <p>
                  <strong>🩺 Boletim de Lesões (Injury Report):</strong> {game.injuryReport}
                </p>
              </div>

              <div className="game-card-actions">
                <button
                  type="button"
                  className="btn btn-edit btn-sm"
                  onClick={() => openScoreModal(game)}
                >
                  ⚙️ Homologar Placar / Status (RN14)
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onDeleteGame(game.id)}
                >
                  🗑️ Excluir Jogo
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Formulário auxiliar para cadastrar um confronto personalizado */}
      <section className="card create-game-section">
        <h3>➕ Cadastrar Nova Partida de Teste (CRUD de Jogos)</h3>
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
              <label htmlFor="game-away">Time Visitante</label>
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
              <label htmlFor="game-home">Time da Casa</label>
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
              <label htmlFor="game-hours">Início daqui a (horas)</label>
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
              <label htmlFor="game-stadium">Estádio (REQ 018)</label>
              <input
                id="game-stadium"
                type="text"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="game-injury">Boletim Médico / Lesões (REQ 018)</label>
              <input
                id="game-injury"
                type="text"
                value={injuryReport}
                onChange={(e) => setInjuryReport(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            ➕ Cadastrar Confronto no PostgreSQL
          </button>
        </form>
      </section>

      {/* Modal nativo <dialog> para homologar placar oficial da partida (RN14) */}
      <dialog ref={scoreDialogRef} aria-labelledby="score-dialog-title" className="app-dialog">
        <h3 id="score-dialog-title">🏁 Homologar Resultado da Partida (RN14)</h3>
        {targetGame && (
          <form onSubmit={handleSaveOfficialResult} className="crud-form">
            <p className="dialog-subtitle">
              Ao finalizar a partida, o sistema recalculará automaticamente os pontos de todos os
              palpites (+1 acerto, -1 erro, +3 placar exato, 0 empate).
            </p>

            <div className="form-group">
              <label htmlFor="modal-game-status">Status da Partida</label>
              <select
                id="modal-game-status"
                value={modalStatus}
                onChange={(e) => setModalStatus(e.target.value)}
              >
                <option value="FINAL">FINAL (Partida Encerrada - Calcula Pontos)</option>
                <option value="SCHEDULED">SCHEDULED (Reabrir Partida Agendada)</option>
                <option value="POSTPONED">POSTPONED (Adiada/Suspensa - RN07)</option>
              </select>
            </div>

            {modalStatus === 'FINAL' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-away-score">
                    Placar Final {targetGame.awayTeamAbbr} (Visitante)
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
                    Placar Final {targetGame.homeTeamAbbr} (Casa)
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
                💾 Salvar Resultado e Atualizar Ranking
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
