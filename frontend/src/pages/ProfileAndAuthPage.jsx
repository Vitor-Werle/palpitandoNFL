import React, { useState, useEffect, useRef } from 'react';
import { fetchUserStats } from '../services/api';
import { NFL_TEAMS, BRAZIL_STATES } from '../utils/nflConstants';

export default function ProfileAndAuthPage({
  currentUser,
  onLogin,
  onRegister,
  onUpdateProfile,
  onDeleteAccount
}) {
  // Estado para estatísticas consolidadas do usuário logado (REQ 015 / RN18)
  const [stats, setStats] = useState(null);

  // Estado para edição do perfil (REQ 017)
  const [editUsername, setEditUsername] = useState('');
  const [editState, setEditState] = useState('SP');
  const [editTeam, setEditTeam] = useState('KC');
  const [editEligible, setEditEligible] = useState(true);

  // Estado para Login (REQ 001)
  const [loginEmail, setLoginEmail] = useState('vitor@nfl.com');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Estado para Cadastro de novo Usuário (REQ 002 / RN20 a RN22)
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState('SP');
  const [regTeam, setRegTeam] = useState('KC');
  const [regLgpdConsent, setRegLgpdConsent] = useState(true);

  // Modal nativo <dialog> para exclusão de conta (RNF 005 - LGPD)
  const deleteAccountDialogRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setEditUsername(currentUser.username);
      setEditState(currentUser.state);
      setEditTeam(currentUser.favoriteTeam);
      setEditEligible(Boolean(currentUser.eligibleForRanking));

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
      favoriteTeam: editTeam,
      eligibleForRanking: editEligible
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin({ email: loginEmail, password: loginPassword });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regLgpdConsent) return;
    onRegister({
      username: regUsername,
      email: regEmail,
      password: regPassword,
      state: regState,
      favoriteTeam: regTeam,
      eligibleForRanking: true
    }).then((ok) => {
      if (ok) {
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
      }
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

  return (
    <div className="page-container">
      {currentUser && (
        <section className="card stats-panel">
          <div className="card-header-flex">
            <div>
              <h3>📊 Painel de Estatísticas Individuais ({currentUser.username}) — REQ 015 / RN18</h3>
              <p className="muted-text">
                E-mail: {currentUser.email} • Estado: {currentUser.state} • Time Favorito:{' '}
                {currentUser.favoriteTeam}
              </p>
            </div>
            <span className="badge badge-exact">Pontuação Atual: {currentUser.points} pts</span>
          </div>

          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-label">Total de Palpites</span>
              <strong className="metric-value">
                {stats ? stats.totalPredictions : '—'}
              </strong>
            </div>
            <div className="metric-box">
              <span className="metric-label">Acertos de Vencedor (+1)</span>
              <strong className="metric-value text-success">{currentUser.hits}</strong>
            </div>
            <div className="metric-box">
              <span className="metric-label">Placares Exatos (+3)</span>
              <strong className="metric-value">{currentUser.exactScores}</strong>
            </div>
            <div className="metric-box">
              <span className="metric-label">Taxa de Aproveitamento</span>
              <strong className="metric-value">
                {stats ? `${stats.winRatePercentage}%` : '0%'}
              </strong>
            </div>
          </div>
        </section>
      )}

      <div className="crud-grid">
        {/* Gestão de Perfil do Usuário Ativo (Update & Delete de Usuário) */}
        {currentUser && (
          <section className="card">
            <h3>⚙️ Gestão de Dados do Perfil (REQ 017 & LGPD RNF 005)</h3>
            <form onSubmit={handleProfileUpdateSubmit} className="crud-form">
              <div className="form-group">
                <label htmlFor="profile-username">Nome de Usuário (Único - RN16)</label>
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
                  <label htmlFor="profile-state">Estado (UF - RN22)</label>
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
                  <label htmlFor="profile-team">Time do Coração (RN22)</label>
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

              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={editEligible}
                  onChange={(e) => setEditEligible(e.target.checked)}
                />
                Elegível para o Ranking Oficial da Temporada (RN15)
              </label>

              <div className="action-buttons">
                <button type="submit" className="btn btn-primary">
                  💾 Atualizar Perfil (UPDATE)
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={openDeleteAccountModal}
                >
                  🗑️ Excluir Minha Conta (LGPD)
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Login e Cadastro de Novo Usuário (REQ 001 e REQ 002) */}
        <section className="card">
          <h3>🔐 Autenticação por E-mail e Senha (REQ 001 / RN20)</h3>
          <form onSubmit={handleLoginSubmit} className="crud-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="login-email">E-mail Cadastrado</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Senha (padrão de teste: 123456)</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-outline">
              Entrar na Conta
            </button>
          </form>

          <hr className="section-divider" />

          <h3>✨ Cadastrar Novo Usuário (REQ 002 / RN16, RN17, RN22)</h3>
          <form onSubmit={handleRegisterSubmit} className="crud-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reg-username">Username Único</label>
                <input
                  id="reg-username"
                  type="text"
                  placeholder="Ex: joao_chiefs"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">E-mail</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="Ex: joao@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="reg-password">Senha Segura (Bcrypt)</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-state">Estado (UF)</label>
                <select
                  id="reg-state"
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                >
                  {BRAZIL_STATES.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="reg-team">Time Favorito NFL</label>
                <select
                  id="reg-team"
                  value={regTeam}
                  onChange={(e) => setRegTeam(e.target.value)}
                >
                  {NFL_TEAMS.map((t) => (
                    <option key={t.abbr} value={t.abbr}>
                      {t.abbr} - {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={regLgpdConsent}
                onChange={(e) => setRegLgpdConsent(e.target.checked)}
                required
              />
              Concordo com os Termos de Uso e Política de Privacidade (LGPD - RNF 005)
            </label>

            <button type="submit" className="btn btn-primary">
              ➕ Criar Conta de Usuário (CREATE)
            </button>
          </form>
        </section>
      </div>

      {/* Modal nativo <dialog> de confirmação de exclusão de conta (RNF 005) */}
      <dialog
        ref={deleteAccountDialogRef}
        aria-labelledby="delete-account-title"
        className="app-dialog"
      >
        <h3 id="delete-account-title">⚠️ Excluir Conta e Dados (Conformidade LGPD)</h3>
        <p className="dialog-subtitle">
          Deseja realmente excluir a conta de{' '}
          <strong>{currentUser ? currentUser.username : ''}</strong> e todos os seus palpites no
          PostgreSQL?
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
            Confirmar Exclusão Definitiva
          </button>
        </div>
      </dialog>
    </div>
  );
}
