import React, { useState, useEffect, useRef } from 'react';
import { fetchUserStats } from '../services/api';
import { NFL_TEAMS, BRAZIL_STATES } from '../utils/nflConstants';

export default function ProfileAndAuthPage({
  currentUser,
  onUpdateProfile,
  onDeleteAccount
}) {
  const [stats, setStats] = useState(null);

  const [editUsername, setEditUsername] = useState('');
  const [editState, setEditState] = useState('SP');
  const [editTeam, setEditTeam] = useState('KC');

  const deleteAccountDialogRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setEditUsername(currentUser.username);
      setEditState(currentUser.state);
      setEditTeam(currentUser.favoriteTeam);

      fetchUserStats(currentUser.id)
        .then((data) => setStats(data.metrics))
        .catch(() => setStats(null));
    } else {
      setStats(null);
    }
  }, [currentUser]);

  const handleProfileUpdateSubmit = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    onUpdateProfile(currentUser.id, {
      username: editUsername,
      state: editState,
      favoriteTeam: editTeam
    });
  };

  const openDeleteAccountModal = () => {
    if (deleteAccountDialogRef.current) {
      deleteAccountDialogRef.current.showModal();
    }
  };

  const closeDeleteAccountModal = () => {
    if (deleteAccountDialogRef.current) {
      deleteAccountDialogRef.current.close();
      deleteAccountDialogRef.current.returnValue = '';
    }
  };

  const confirmDeleteAccount = () => {
    if (!currentUser) return;
    onDeleteAccount(currentUser.id).then((ok) => {
      if (ok) closeDeleteAccountModal();
    });
  };

  if (!currentUser) return null;

  return (
    <div className="page-container">
      <section className="card stats-panel">
        <div className="card-header-flex">
          <div>
            <h2 className="section-title">Desempenho de {currentUser.username}</h2>
            <p className="muted-text">
              {currentUser.email} • {currentUser.state} • Torcedor do {currentUser.favoriteTeam}
            </p>
          </div>
          <span className="badge badge-exact">{currentUser.points} pontos</span>
        </div>

        <div className="metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Total de Palpites</span>
            <strong className="metric-value">{stats ? stats.totalPredictions : '—'}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Acertos de Vencedor</span>
            <strong className="metric-value text-success">{currentUser.hits}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Placares Exatos</span>
            <strong className="metric-value">{currentUser.exactScores}</strong>
          </div>
          <div className="metric-box">
            <span className="metric-label">Aproveitamento</span>
            <strong className="metric-value">
              {stats ? `${stats.winRatePercentage}%` : '0%'}
            </strong>
          </div>
        </div>
      </section>

      <section className="card profile-edit-card">
        <h3 className="section-title">Dados da Conta</h3>
        <form onSubmit={handleProfileUpdateSubmit} className="crud-form">
          <div className="form-group">
            <label htmlFor="profile-username">Nome de Usuário</label>
            <input
              id="profile-username"
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profile-state">Estado (UF)</label>
              <select
                id="profile-state"
                value={editState}
                onChange={(e) => setEditState(e.target.value)}
              >
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="profile-team">Time Favorito</label>
              <select
                id="profile-team"
                value={editTeam}
                onChange={(e) => setEditTeam(e.target.value)}
              >
                {NFL_TEAMS.map((t) => (
                  <option key={t.abbr} value={t.abbr}>
                    {t.abbr} - {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button type="submit" className="btn btn-primary">
              Salvar Alterações
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={openDeleteAccountModal}
            >
              Excluir Conta
            </button>
          </div>
        </form>
      </section>

      <dialog
        ref={deleteAccountDialogRef}
        aria-labelledby="delete-account-title"
        className="app-dialog"
      >
        <h3 id="delete-account-title">Excluir Conta</h3>
        <p className="dialog-subtitle">
          Deseja realmente excluir a conta de <strong>{currentUser.username}</strong> e todos os
          seus palpites registrados?
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-outline"
            autoFocus
            onClick={closeDeleteAccountModal}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-danger" onClick={confirmDeleteAccount}>
            Confirmar Exclusão
          </button>
        </div>
      </dialog>
    </div>
  );
}
