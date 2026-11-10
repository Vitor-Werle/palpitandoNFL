import React, { useState, useRef, useEffect } from 'react';

export default function PredictionsCrudPage({
  currentUser,
  games,
  predictions,
  onCreatePrediction,
  onUpdatePrediction,
  onDeletePrediction
}) {
  // Formulário de Novo Palpite
  const [selectedGameId, setSelectedGameId] = useState('');
  const [predictedWinner, setPredictedWinner] = useState('');
  const [predictedHomeScore, setPredictedHomeScore] = useState('');
  const [predictedAwayScore, setPredictedAwayScore] = useState('');
  const [notes, setNotes] = useState('');

  // Filtros de listagem
  const [filterScope, setFilterScope] = useState('ALL');
  const [filterWeek, setFilterWeek] = useState('ALL');

  // Modal de edição
  const editDialogRef = useRef(null);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [editWinner, setEditWinner] = useState('');
  const [editHomeScore, setEditHomeScore] = useState('');
  const [editAwayScore, setEditAwayScore] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Modal de exclusão
  const deleteDialogRef = useRef(null);
  const [deletingPrediction, setDeletingPrediction] = useState(null);

  const openGames = games.filter((g) => !g.isLocked);
  const selectedGame = games.find((g) => g.id === Number(selectedGameId)) || null;

  useEffect(() => {
    if (!selectedGameId && openGames.length > 0) {
      setSelectedGameId(String(openGames[0].id));
      setPredictedWinner(openGames[0].homeTeamAbbr);
    }
  }, [games]);

  const handleGameSelectionChange = (e) => {
    const newGameId = e.target.value;
    setSelectedGameId(newGameId);
    const found = games.find((g) => g.id === Number(newGameId));
    if (found) {
      setPredictedWinner(found.homeTeamAbbr);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!currentUser || !selectedGameId || !predictedWinner) return;

    onCreatePrediction({
      userId: currentUser.id,
      gameId: Number(selectedGameId),
      predictedWinner,
      predictedHomeScore: predictedHomeScore === '' ? null : Number(predictedHomeScore),
      predictedAwayScore: predictedAwayScore === '' ? null : Number(predictedAwayScore),
      notes: notes.trim() || null
    }).then((success) => {
      if (success) {
        setPredictedHomeScore('');
        setPredictedAwayScore('');
        setNotes('');
      }
    });
  };

  const openEditModal = (prediction) => {
    setEditingPrediction(prediction);
    setEditWinner(prediction.predictedWinner);
    setEditHomeScore(
      prediction.predictedHomeScore !== null && prediction.predictedHomeScore !== undefined
        ? String(prediction.predictedHomeScore)
        : ''
    );
    setEditAwayScore(
      prediction.predictedAwayScore !== null && prediction.predictedAwayScore !== undefined
        ? String(prediction.predictedAwayScore)
        : ''
    );
    setEditNotes(prediction.notes || '');

    if (editDialogRef.current) {
      editDialogRef.current.showModal();
    }
  };

  const closeEditModal = () => {
    if (editDialogRef.current) {
      editDialogRef.current.close();
      editDialogRef.current.returnValue = '';
    }
    setEditingPrediction(null);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingPrediction) return;

    onUpdatePrediction(editingPrediction.id, {
      predictedWinner: editWinner,
      predictedHomeScore: editHomeScore === '' ? null : Number(editHomeScore),
      predictedAwayScore: editAwayScore === '' ? null : Number(editAwayScore),
      notes: editNotes.trim() || null
    }).then((success) => {
      if (success) {
        closeEditModal();
      }
    });
  };

  const openDeleteModal = (prediction) => {
    setDeletingPrediction(prediction);
    if (deleteDialogRef.current) {
      deleteDialogRef.current.showModal();
    }
  };

  const closeDeleteModal = () => {
    if (deleteDialogRef.current) {
      deleteDialogRef.current.close();
      deleteDialogRef.current.returnValue = '';
    }
    setDeletingPrediction(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingPrediction) return;
    onDeletePrediction(deletingPrediction.id).then((success) => {
      if (success) {
        closeDeleteModal();
      }
    });
  };

  const filteredPredictions = predictions.filter((pred) => {
    if (filterScope === 'MINE' && currentUser && pred.userId !== currentUser.id) {
      return false;
    }
    if (filterWeek !== 'ALL' && pred.game && String(pred.game.week) !== filterWeek) {
      return false;
    }
    return true;
  });

  const renderOutcomeBadge = (pred) => {
    const statusMap = {
      PENDING: { label: 'Aguardando', className: 'badge-pending' },
      HIT: { label: 'Acertou (+1 pt)', className: 'badge-hit' },
      EXACT_HIT: { label: 'Placar Exato (+4 pts)', className: 'badge-exact' },
      MISS: { label: 'Errou (-1 pt)', className: 'badge-miss' },
      NEUTRAL: { label: 'Empate (0 pt)', className: 'badge-neutral' },
      SUSPENDED: { label: 'Adiado', className: 'badge-neutral' }
    };
    const info = statusMap[pred.outcomeStatus] || statusMap.PENDING;
    return <span className={`badge ${info.className}`}>{info.label}</span>;
  };

  return (
    <div className="page-container">
      <div className="crud-grid">
        {/* Novo Palpite */}
        <section className="card" aria-labelledby="create-heading">
          <h2 id="create-heading" className="section-title">
            Novo Palpite
          </h2>

          <form onSubmit={handleCreateSubmit} className="crud-form">
            <div className="form-group">
              <label htmlFor="create-game-select">Partida</label>
              <select
                id="create-game-select"
                value={selectedGameId}
                onChange={handleGameSelectionChange}
                required
              >
                {openGames.length === 0 ? (
                  <option value="">Nenhuma partida aberta no momento</option>
                ) : (
                  openGames.map((g) => (
                    <option key={g.id} value={g.id}>
                      Semana {g.week}: {g.awayTeamAbbr} @ {g.homeTeamAbbr} ({g.awayTeam} vs{' '}
                      {g.homeTeam})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedGame && (
              <>
                <div className="form-group">
                  <label>Time Vencedor</label>
                  <div className="winner-selector">
                    <button
                      type="button"
                      className={`team-choice-btn ${
                        predictedWinner === selectedGame.awayTeamAbbr ? 'selected' : ''
                      }`}
                      onClick={() => setPredictedWinner(selectedGame.awayTeamAbbr)}
                    >
                      <span className="team-abbr">{selectedGame.awayTeamAbbr}</span>
                      <span className="team-name">{selectedGame.awayTeam}</span>
                    </button>

                    <button
                      type="button"
                      className={`team-choice-btn ${
                        predictedWinner === selectedGame.homeTeamAbbr ? 'selected' : ''
                      }`}
                      onClick={() => setPredictedWinner(selectedGame.homeTeamAbbr)}
                    >
                      <span className="team-abbr">{selectedGame.homeTeamAbbr}</span>
                      <span className="team-name">{selectedGame.homeTeam}</span>
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="create-away-score">
                      Placar {selectedGame.awayTeamAbbr} (Opcional)
                    </label>
                    <input
                      id="create-away-score"
                      type="number"
                      min="0"
                      max="99"
                      placeholder="Ex: 24"
                      value={predictedAwayScore}
                      onChange={(e) => setPredictedAwayScore(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="create-home-score">
                      Placar {selectedGame.homeTeamAbbr} (Opcional)
                    </label>
                    <input
                      id="create-home-score"
                      type="number"
                      min="0"
                      max="99"
                      placeholder="Ex: 27"
                      value={predictedHomeScore}
                      onChange={(e) => setPredictedHomeScore(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="create-notes">Observação</label>
                  <input
                    id="create-notes"
                    type="text"
                    placeholder="Comentário opcional sobre a partida"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="stadium-info-box">
                  <p>
                    <strong>Estádio:</strong> {selectedGame.stadium}
                  </p>
                  <p>
                    <strong>Boletim Médico:</strong> {selectedGame.injuryReport}
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={!selectedGame}
            >
              Salvar Palpite
            </button>
          </form>
        </section>

        {/* Lista de Palpites */}
        <section className="card" aria-labelledby="read-heading">
          <div className="card-header-flex">
            <h2 id="read-heading" className="section-title">
              Palpites Registrados ({filteredPredictions.length})
            </h2>

            <div className="filter-bar">
              <select
                aria-label="Filtrar palpites por usuário"
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
              >
                <option value="ALL">Todos os Usuários</option>
                <option value="MINE">Meus Palpites</option>
              </select>

              <select
                aria-label="Filtrar palpites por semana"
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
              >
                <option value="ALL">Todas as Semanas</option>
                <option value="9">Semana 9</option>
                <option value="10">Semana 10</option>
              </select>
            </div>
          </div>

          <div
            tabIndex="0"
            role="region"
            aria-labelledby="predictions-table-caption"
            className="table-wrapper"
          >
            <table className="responsive-data-table predictions-table">
              <caption id="predictions-table-caption" className="sr-only">
                Lista de palpites registrados na plataforma
              </caption>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Partida</th>
                  <th>Palpite</th>
                  <th>Resultado</th>
                  <th>Observação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhum palpite encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredPredictions.map((pred) => {
                    const game = pred.game;
                    const now = new Date();
                    const kickoff = game ? new Date(game.kickoffTime) : now;
                    const hoursLeft = (kickoff.getTime() - now.getTime()) / (1000 * 60 * 60);
                    const isLocked = !game || game.status !== 'SCHEDULED' || hoursLeft < 2;

                    return (
                      <tr key={pred.id}>
                        <th>
                          <strong>{pred.user ? pred.user.username : `Usuário #${pred.userId}`}</strong>
                          {pred.user && (
                            <span className="sub-meta">
                              {pred.user.state} • {pred.user.favoriteTeam}
                            </span>
                          )}
                        </th>
                        <td>
                          {game ? (
                            <>
                              <strong>
                                {game.awayTeamAbbr} @ {game.homeTeamAbbr}
                              </strong>
                              <span className="sub-meta">
                                Semana {game.week} •{' '}
                                {game.status === 'FINAL'
                                  ? `Final: ${game.awayScore} x ${game.homeScore}`
                                  : new Date(game.kickoffTime).toLocaleDateString('pt-BR')}
                              </span>
                            </>
                          ) : (
                            `Jogo #${pred.gameId}`
                          )}
                        </td>
                        <td>
                          <span className="winner-highlight">{pred.predictedWinner}</span>
                          {pred.predictedHomeScore !== null && pred.predictedAwayScore !== null ? (
                            <span className="sub-meta">
                              {game ? game.awayTeamAbbr : 'VIS'} {pred.predictedAwayScore} x{' '}
                              {pred.predictedHomeScore} {game ? game.homeTeamAbbr : 'CASA'}
                            </span>
                          ) : (
                            <span className="sub-meta">Apenas vencedor</span>
                          )}
                        </td>
                        <td>{renderOutcomeBadge(pred)}</td>
                        <td>{pred.notes || '—'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn btn-edit btn-sm"
                              onClick={() => openEditModal(pred)}
                              disabled={isLocked}
                              title={
                                isLocked
                                  ? 'Partida encerrada ou a menos de 2h do início'
                                  : 'Editar palpite'
                              }
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => openDeleteModal(pred)}
                            >
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Modal de Edição */}
      <dialog
        ref={editDialogRef}
        aria-labelledby="edit-prediction-title"
        className="app-dialog"
      >
        <h3 id="edit-prediction-title">Editar Palpite</h3>
        {editingPrediction && editingPrediction.game && (
          <form onSubmit={handleUpdateSubmit} className="crud-form">
            <p className="dialog-subtitle">
              {editingPrediction.game.awayTeam} ({editingPrediction.game.awayTeamAbbr}) @{' '}
              {editingPrediction.game.homeTeam} ({editingPrediction.game.homeTeamAbbr})
            </p>

            <div className="form-group">
              <label>Time Vencedor</label>
              <div className="winner-selector">
                <button
                  type="button"
                  className={`team-choice-btn ${
                    editWinner === editingPrediction.game.awayTeamAbbr ? 'selected' : ''
                  }`}
                  onClick={() => setEditWinner(editingPrediction.game.awayTeamAbbr)}
                >
                  <span className="team-abbr">{editingPrediction.game.awayTeamAbbr}</span>
                  <span className="team-name">{editingPrediction.game.awayTeam}</span>
                </button>
                <button
                  type="button"
                  className={`team-choice-btn ${
                    editWinner === editingPrediction.game.homeTeamAbbr ? 'selected' : ''
                  }`}
                  onClick={() => setEditWinner(editingPrediction.game.homeTeamAbbr)}
                >
                  <span className="team-abbr">{editingPrediction.game.homeTeamAbbr}</span>
                  <span className="team-name">{editingPrediction.game.homeTeam}</span>
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edit-away-score">
                  Placar {editingPrediction.game.awayTeamAbbr}
                </label>
                <input
                  id="edit-away-score"
                  type="number"
                  min="0"
                  max="99"
                  value={editAwayScore}
                  onChange={(e) => setEditAwayScore(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-home-score">
                  Placar {editingPrediction.game.homeTeamAbbr}
                </label>
                <input
                  id="edit-home-score"
                  type="number"
                  min="0"
                  max="99"
                  value={editHomeScore}
                  onChange={(e) => setEditHomeScore(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-notes">Observação</label>
              <input
                id="edit-notes"
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="dialog-actions">
              <button type="button" className="btn btn-outline" onClick={closeEditModal}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* Modal de Exclusão */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-prediction-title"
        className="app-dialog"
      >
        <h3 id="delete-prediction-title">Excluir Palpite</h3>
        {deletingPrediction && (
          <div>
            <p className="dialog-subtitle">
              Tem certeza que deseja excluir o palpite no vencedor{' '}
              <strong>{deletingPrediction.predictedWinner}</strong>?
            </p>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-outline"
                autoFocus
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>
                Excluir
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
