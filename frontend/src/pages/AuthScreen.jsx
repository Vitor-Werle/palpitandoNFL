import React, { useState } from 'react';
import { NFL_TEAMS, BRAZIL_STATES } from '../utils/nflConstants';

export default function AuthScreen({ users, onLogin, onRegister }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login
  const [loginEmail, setLoginEmail] = useState('vitor@nfl.com');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Cadastro
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState('SP');
  const [regTeam, setRegTeam] = useState('KC');
  const [regTerms, setRegTerms] = useState(true);

  const visibleAccounts = (users || []).slice(0, 2);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onLogin({ email: loginEmail, password: loginPassword });
  };

  const handleQuickAccountSelect = (accountEmail) => {
    setLoginEmail(accountEmail);
    setLoginPassword('123456');
    onLogin({ email: accountEmail, password: '123456' });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regTerms) return;
    onRegister({
      username: regUsername,
      email: regEmail,
      password: regPassword,
      state: regState,
      favoriteTeam: regTeam,
      eligibleForRanking: true
    });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">NFL</span>
          <h1>Palpitando NFL</h1>
          <p>Plataforma de Palpites e Ranking da Temporada</p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Criar Conta
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <form onSubmit={handleLoginSubmit} className="crud-form">
              <div className="form-group">
                <label htmlFor="auth-login-email">E-mail</label>
                <input
                  id="auth-login-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="auth-login-password">Senha</label>
                <input
                  id="auth-login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Acessar Plataforma
              </button>
            </form>

            {visibleAccounts.length > 0 && (
              <div className="demo-accounts-box">
                <span className="demo-accounts-title">Contas Disponíveis (Acesso Rápido)</span>
                <div className="demo-accounts-grid">
                  {visibleAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      className="demo-account-card"
                      onClick={() => handleQuickAccountSelect(acc.email)}
                    >
                      <div className="demo-account-top">
                        <strong>{acc.username}</strong>
                        <span className="team-pill">{acc.favoriteTeam}</span>
                      </div>
                      <span className="demo-account-email">{acc.email}</span>
                      <span className="demo-account-meta">
                        {acc.state} • Senha: <code>123456</code>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="crud-form">
            <div className="form-group">
              <label htmlFor="auth-reg-username">Nome de Usuário</label>
              <input
                id="auth-reg-username"
                type="text"
                placeholder="Ex: joao_chiefs"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-reg-email">E-mail</label>
              <input
                id="auth-reg-email"
                type="email"
                placeholder="Ex: joao@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-reg-password">Senha</label>
              <input
                id="auth-reg-password"
                type="password"
                placeholder="Mínimo de 6 caracteres"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="auth-reg-state">Estado (UF)</label>
                <select
                  id="auth-reg-state"
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
                <label htmlFor="auth-reg-team">Time Favorito</label>
                <select
                  id="auth-reg-team"
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
                checked={regTerms}
                onChange={(e) => setRegTerms(e.target.checked)}
                required
              />
              Concordo com os termos de uso e privacidade da plataforma
            </label>

            <button type="submit" className="btn btn-primary btn-block">
              Cadastrar e Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
