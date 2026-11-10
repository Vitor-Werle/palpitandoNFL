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
    { id: 'palpites', label: 'Palpites' },
    { id: 'games', label: 'Jogos da Rodada' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'profile', label: 'Conta & Estatísticas' }
  ];

  const visibleAccounts = (users || []).slice(0, 2);

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-badge">NFL</span>
        <div>
          <h1>Palpitando NFL</h1>
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
        {currentUser && (
          <div className="user-controls">
            <label htmlFor="quick-user-switch" className="sr-only">
              Alternar conta
            </label>
            <select
              id="quick-user-switch"
              className="user-select"
              value={currentUser.id}
              onChange={(e) => onSelectUser(Number(e.target.value))}
            >
              {visibleAccounts.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.favoriteTeam}) • {u.points} pts
                </option>
              ))}
              {!visibleAccounts.some((u) => u.id === currentUser.id) && (
                <option value={currentUser.id}>
                  {currentUser.username} ({currentUser.favoriteTeam}) • {currentUser.points} pts
                </option>
              )}
            </select>
            <button type="button" className="btn btn-outline btn-sm" onClick={onLogout}>
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
