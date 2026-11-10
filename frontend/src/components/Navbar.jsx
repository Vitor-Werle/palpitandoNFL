import React from 'react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  users,
  onSelectUser,
  onLogout
}) {
  const navItems = [
    { id: 'crud', label: '📋 CRUD de Palpites (Avaliação)' },
    { id: 'games', label: '🏈 Jogos da Rodada & Simulador' },
    { id: 'ranking', label: '🏆 Ranking & Filtros' },
    { id: 'profile', label: '👤 Conta, Estatísticas & Login' }
  ];

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-badge">NFL</span>
        <div>
          <h1>Palpitando NFL</h1>
          <p className="brand-subtitle">Plataforma Web de Palpites & Ranking Oficial</p>
        </div>
      </div>

      <nav className="navbar-links" aria-label="Navegação principal">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-btn ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="navbar-user">
        {currentUser ? (
          <div className="user-Controls">
            <label htmlFor="quick-user-switch" className="sr-only">
              Trocar usuário ativo
            </label>
            <select
              id="quick-user-switch"
              className="user-select"
              value={currentUser.id}
              onChange={(e) => onSelectUser(Number(e.target.value))}
              title="Troca rápida de usuário para demonstração na avaliação"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.username} ({u.state} • {u.favoriteTeam}) — {u.points} pts
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-outline btn-sm" onClick={onLogout}>
              Sair
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setActiveTab('profile')}
          >
            Entrar / Cadastrar
          </button>
        )}
      </div>
    </header>
  );
}
