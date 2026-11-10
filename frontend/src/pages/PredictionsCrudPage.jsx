import React, { useState, useRef, useEffect } from 'react';

export default function PredictionsCrudPage({
  currentUser,
  games,
  predictions,
  onCreatePrediction,
  onUpdatePrediction,
  onDeletePrediction,
  onNavigateToGames
}) {
  // Estado para o formulário de CREATE (Cadastrar novo palpite)
  const [selectedGameId, setSelectedGameId] = useState('');
  const [predictedWinner, setPredictedWinner] = useState('');
  const [predictedHomeScore, setPredictedHomeScore] = useState('');
  const [predictedAwayScore, setPredictedAwayScore] = useState('');
  const [notes, setNotes] = useState('');

  // Filtros de READ (Consultar/Listar palpites)
  const [filterScope, setFilterScope] = useState('ALL'); // 'MINE' ou 'ALL'
  const [filterWeek, setFilterWeek] = useState('ALL');

  // Estado e Ref para o modal nativo <dialog> de UPDATE (Alterar palpite)
  const editDialogRef = useRef(null);
  const [editingPrediction, setEditingPrediction] = useState(null);
  const [editWinner, setEditWinner] = useState('');
  const [editHomeScore, setEditHomeScore] = useState('');
  const [editAwayScore, setEditAwayScore] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Estado e Ref para o modal nativo <dialog> de DELETE (Excluir palpite)
  const deleteDialogRef = useRef(null);
  const [deletingPrediction, setDeletingPrediction] = useState(null);

  // Jogos disponíveis para cadastrar palpite (SCHEDULED e > 2h para o início - RN01/RN09)
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

  // ==================== 1. CREATE (CADASTRAR) ====================
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!selectedGameId || !predictedWinner) return;

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

  // ==================== 3. UPDATE (ABRIR MODAL E SALVAR) ====================
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

  // ==================== 4. DELETE (ABRIR MODAL E CONFIRMAR) ====================
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

  // ==================== 2. READ (FILTRAGEM DA LISTA) ====================
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
      PENDING: { label: '⏳ Aguardando Jogo', className: 'badge-pending' },
      HIT: { label: `✅ Acertou Vencedor (+1 pt)`, className: 'badge-hit' },
      EXACT_HIT: { label: `🎯 Placar Exato! (+4 pts)`, className: 'badge-exact' },
      MISS: { label: `❌ Errou Vencedor (-1 pt)`, className: 'badge-miss' },
      NEUTRAL: { label: `⚖️ Empate / Neutro (0 pt)`, className: 'badge-neutral' },
      SUSPENDED: { label: `⏸️ Jogo Adiado (Suspenso)`, className: 'badge-neutral' }
    };
    const info = statusMap[pred.outcomeStatus] || statusMap.PENDING;
    return <span className={`badge ${info.className}`}>{info.label}</span>;
  };

  return (
    <div className="page-container">
      {/* Banner explicativo para a avaliação do CRUD */}
      <section className="eval-banner">
        <div>
          <h2>Painel de Demonstração do CRUD (PostgreSQL + Sequelize ORM)</h2>
          <p>
            Realize aqui as 4 operações avaliadas: <strong>Create (Cadastrar)</strong>,{' '}
            <strong>Read (Consultar/Listar)</strong>, <strong>Update (Alterar)</strong> e{' '}
            <strong>Delete (Excluir)</strong> diretamente conectadas ao banco{' '}
            <code>palpitando_nfl</code>.
          </p>
        </div>
        <a
          href="http://localhost:3001/api-docs"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline"
        >
          📚 Abrir Swagger API Docs
        </a>
      </section>

      <div className="crud-grid">
        {/* ==================== CARD DE CREATE (CADASTRAR) ==================== */}
        <section className="card crud-create-card" aria-labelledby="create-heading">
          <div className="card-header">
            <span className="crud-step-pill create-pill">CREATE • 0,5 pt</span>
            <h3 id="create-heading">Cadastrar Novo Palpite</h3>
          </div>

          {!currentUser ? (
            <p className="muted-text">
              Selecione ou faça login com um usuário no topo da página para registrar palpites.
            </p>
          ) : (
            <form onSubmit={handleCreateSubmit} className="crud-form">
              <div className="form-group">
                <label htmlFor="create-game-select">1. Escolha a Partida Aberta (Semana 10)</label>
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
                <small className="field-hint">
                  RN01 / RN09: Apenas jogos com mais de 2 horas para o início estão disponíveis.
                </small>
              </div>

              {selectedGame && (
                <>
                  <div className="form-group">
                    <label>2. Selecione o Time Vencedor (RN04 - Sem empate)</label>
                    <div className="winner-selector">
                      <button
                        type="button"
                        className={`team-choice-btn ${
                          predictedWinner === selectedGame.awayTeamAbbr ? 'selected' : ''
                        }`}
                        onClick={() => setPredictedWinner(selectedGame.awayTeamAbbr)}
                      >
                        <span className="team-abbr">{selectedGame.awayTeamAbbr}</span>
                        <span className="team-name">{selectedGame.awayTeam} (Visitante)</span>
                      </button>

                      <button
                        type="button"
                        className={`team-choice-btn ${
                          predictedWinner === selectedGame.homeTeamAbbr ? 'selected' : ''
                        }`}
                        onClick={() => setPredictedWinner(selectedGame.homeTeamAbbr)}
                      >
                        <span className="team-abbr">{selectedGame.homeTeamAbbr}</span>
                        <span className="team-name">{selectedGame.homeTeam} (Casa)</span>
                      </button>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="create-away-score">
                        Placar {selectedGame.awayTeamAbbr} (RN05 - Opcional)
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
                        Placar {selectedGame.homeTeamAbbr} (RN05 - Opcional)
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
                    <label htmlFor="create-notes">Observação / Justificativa do Palpite</label>
                    <input
                      id="create-notes"
                      type="text"
                      placeholder="Ex: Ataque aéreo forte jogando em casa!"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="stadium-info-box">
                    <p>
                      <strong>🏟️ Estádio (REQ 018):</strong> {selectedGame.stadium}
                    </p>
                    <p>
                      <strong>🩺 Boletim Médico (Lesões):</strong> {selectedGame.injuryReport}
                    </p>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={!selectedGame}
              >
                ➕ Cadastrar Palpite (CREATE)
              </button>
            </form>
          )}
        </section>

        {/* ==================== CARD DE READ / UPDATE / DELETE ==================== */}
        <section className="card crud-list-card" aria-labelledby="read-heading">
          <div className="card-header-flex">
            <div>
              <div className="pill-group">
                <span className="crud-step-pill read-pill">READ • 0,5 pt</span>
                <span className="crud-step-pill update-pill">UPDATE • 0,5 pt</span>
                <span className="crud-step-pill delete-pill">DELETE • 0,5 pt</span>
              </div>
              <h3 id="read-heading">
                Palpites Cadastrados no Banco ({filteredPredictions.length})
              </h3>
            </div>

            <div className="filter-bar">
              <select
                aria-label="Filtrar palpites por usuário"
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
              >
                <option value="ALL">Todos os Usuários</option>
                <option value="MINE">
                  Apenas Meus Palpites ({currentUser ? currentUser.username : ''})
                </option>
              </select>

              <select
                aria-label="Filtrar palpites por semana"
                value={filterWeek}
                onChange={(e) => setFilterWeek(e.target.value)}
              >
                <option value="ALL">Todas as Semanas</option>
                <option value="9">Semana 9 (Finalizada - Histórico)</option>
                <option value="10">Semana 10 (Rodada Atual)</option>
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
                Lista de palpites registrados na plataforma com opções de editar e excluir
              </caption>
              <thead>
                <tr>
                  <th>ID / Usuário</th>
                  <th>Confronto (Semana)</th>
                  <th>Vencedor & Placar Previsto</th>
                  <th>Status / Pontos</th>
                  <th>Observação</th>
                  <th>Ações (Update / Delete)</th>
                </tr>
              </thead>
              <tbody>
                {filteredPredictions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      Nenhum palpite encontrado para este filtro. Cadastre um novo ao lado!
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
                          <span className="record-id">#{pred.id}</span>{' '}
                          <strong>{pred.user ? pred.user.username : `User #${pred.userId}`}</strong>
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
                                  : new Date(game.kickoffTime).toLocaleString('pt-BR')}
                              </span>
                            </>
                          ) : (
                            `Jogo #${pred.gameId}`
                          )}
                        </td>
                        <td>
                          <span className="winner-highlight">🏆 {pred.predictedWinner}</span>
                          {pred.predictedHomeScore !== null && pred.predictedAwayScore !== null ? (
                            <span className="sub-meta">
                              Placar Exato: {game ? game.awayTeamAbbr : 'VIS'}{' '}
                              {pred.predictedAwayScore} x {pred.predictedHomeScore}{' '}
                              {game ? game.homeTeamAbbr : 'CASA'}
                            </span>
                          ) : (
                            <span className="sub-meta">Sem placar exato</span>
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
                                  ? 'Bloqueado (RN01/RN09: menos de 2h para o jogo ou já finalizado)'
                                  : 'Editar este palpite (UPDATE)'
                              }
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => openDeleteModal(pred)}
                              title="Excluir este palpite do banco de dados (DELETE)"
                            >
                              🗑️ Excluir
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

      {/* ==================== MODAL NATIVO <dialog> PARA UPDATE ==================== */}
      <dialog
        ref={editDialogRef}
        aria-labelledby="edit-prediction-title"
        className="app-dialog"
      >
        <h3 id="edit-prediction-title">
          ✏️ Alterar Palpite #{editingPrediction ? editingPrediction.id : ''} (UPDATE)
        </h3>
        {editingPrediction && editingPrediction.game && (
          <form onSubmit={handleUpdateSubmit} className="crud-form">
            <p className="dialog-subtitle">
              Confronto:{' '}
              <strong>
                {editingPrediction.game.awayTeam} ({editingPrediction.game.awayTeamAbbr}) @{' '}
                {editingPrediction.game.homeTeam} ({editingPrediction.game.homeTeamAbbr})
              </strong>
            </p>

            <div className="form-group">
              <label>Time Vencedor Escolhido (RN04)</label>
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
              <label htmlFor="edit-notes">Observação / Justificativa</label>
              <input
                id="edit-notes"
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={closeEditModal}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                💾 Salvar Alterações (PUT)
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* ==================== MODAL NATIVO <dialog> PARA DELETE ==================== */}
      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-prediction-title"
        className="app-dialog"
      >
        <h3 id="delete-prediction-title">🗑️ Confirmar Exclusão de Palpite (DELETE)</h3>
        {deletingPrediction && (
          <div>
            <p className="dialog-subtitle">
              Tem certeza que deseja excluir permanentemente o palpite{' '}
              <strong>#{deletingPrediction.id}</strong> (Vencedor:{' '}
              <strong>{deletingPrediction.predictedWinner}</strong>) do banco de dados PostgreSQL?
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
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                Confirmar Exclusão (DELETE)
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
