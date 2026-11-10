import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import PredictionsCrudPage from './pages/PredictionsCrudPage';
import GamesRoundPage from './pages/GamesRoundPage';
import RankingPage from './pages/RankingPage';
import ProfileAndAuthPage from './pages/ProfileAndAuthPage';
import {
  fetchPredictions,
  createPrediction,
  updatePrediction,
  deletePrediction,
  fetchGames,
  createGame,
  updateGame,
  deleteGame,
  syncNflGames,
  fetchUsers,
  loginUser,
  registerUser,
  updateUser,
  deleteUser
} from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('crud');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estado de notificações em tempo real (RNF 007 / RNF 008 / REQ 012)
  const [feedback, setFeedback] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev && prev.message === message ? null : prev));
    }, 5000);
  };

  /**
   * Carrega todos os dados do Back-end usando Promises (Promise.all)
   */
  const loadAllData = useCallback((preferredUserId = null) => {
    setConnectionError(false);

    return Promise.all([fetchUsers(), fetchGames(), fetchPredictions()])
      .then(([usersData, gamesData, predictionsData]) => {
        setUsers(usersData);
        setGames(gamesData);
        setPredictions(predictionsData);
        setRefreshTrigger((prev) => prev + 1);

        setCurrentUser((prevUser) => {
          const targetId = preferredUserId || (prevUser ? prevUser.id : null);
          if (targetId) {
            const matched = usersData.find((u) => u.id === targetId);
            if (matched) return matched;
          }
          return usersData.length > 0 ? usersData[0] : null;
        });
      })
      .catch((error) => {
        setConnectionError(true);
        showToast('error', `Falha de conexão com o Back-end: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== HANDLERS DO CRUD DE PALPITES ====================

  const handleCreatePrediction = (payload) => {
    return createPrediction(payload)
      .then((res) => {
        showToast('success', `✅ [CREATE] ${res.message}`);
        return loadAllData().then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao cadastrar palpite: ${err.message}`);
        return false;
      });
  };

  const handleUpdatePrediction = (id, payload) => {
    return updatePrediction(id, payload)
      .then((res) => {
        showToast('success', `✏️ [UPDATE] ${res.message}`);
        return loadAllData().then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao atualizar palpite: ${err.message}`);
        return false;
      });
  };

  const handleDeletePrediction = (id) => {
    return deletePrediction(id)
      .then((res) => {
        showToast('success', `🗑️ [DELETE] ${res.message}`);
        return loadAllData().then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao excluir palpite: ${err.message}`);
        return false;
      });
  };

  // ==================== HANDLERS DE JOGOS DA RODADA ====================

  const handleSyncNflGames = () => {
    return syncNflGames()
      .then((res) => {
        showToast('success', `🏈 ${res.message}`);
        return loadAllData();
      })
      .catch((err) => {
        showToast('error', `❌ Erro na sincronização: ${err.message}`);
      });
  };

  const handleCreateGame = (payload) => {
    return createGame(payload)
      .then((res) => {
        showToast('success', `✅ ${res.message}`);
        return loadAllData();
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao criar partida: ${err.message}`);
      });
  };

  const handleUpdateGame = (id, payload) => {
    return updateGame(id, payload)
      .then((res) => {
        showToast('success', `🏁 ${res.message}`);
        return loadAllData().then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao atualizar partida: ${err.message}`);
        return false;
      });
  };

  const handleDeleteGame = (id) => {
    return deleteGame(id)
      .then((res) => {
        showToast('success', `🗑️ ${res.message}`);
        return loadAllData();
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao excluir partida: ${err.message}`);
      });
  };

  // ==================== HANDLERS DE USUÁRIO E AUTENTICAÇÃO ====================

  const handleSelectUser = (userId) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast('info', `👤 Usuário ativo alterado para: ${found.username}`);
    }
  };

  const handleLogin = (credentials) => {
    return loginUser(credentials)
      .then((res) => {
        setCurrentUser(res.user);
        showToast('success', `🔐 Bem-vindo(a), ${res.user.username}!`);
        return loadAllData(res.user.id);
      })
      .catch((err) => {
        showToast('error', `❌ Falha no login: ${err.message}`);
      });
  };

  const handleRegister = (payload) => {
    return registerUser(payload)
      .then((res) => {
        showToast('success', `🎉 ${res.message}`);
        return loadAllData(res.user.id).then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro no cadastro: ${err.message}`);
        return false;
      });
  };

  const handleUpdateProfile = (id, payload) => {
    return updateUser(id, payload)
      .then((res) => {
        showToast('success', `💾 ${res.message}`);
        return loadAllData(res.user.id);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao atualizar perfil: ${err.message}`);
      });
  };

  const handleDeleteAccount = (id) => {
    return deleteUser(id)
      .then((res) => {
        showToast('success', `🗑️ ${res.message}`);
        setCurrentUser(null);
        return loadAllData().then(() => true);
      })
      .catch((err) => {
        showToast('error', `❌ Erro ao excluir conta: ${err.message}`);
        return false;
      });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('info', '👋 Sessão encerrada com sucesso (REQ 005).');
  };

  return (
    <div className="app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        users={users}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      {/* Alerta de tolerância a falhas de conexão com botão de Retry (RNF 008) */}
      {connectionError && (
        <div className="connection-banner" role="alert">
          <span>
            ⚠️ Não foi possível conectar ao servidor Back-end em{' '}
            <code>http://localhost:3001</code>. Verifique se o servidor Express está rodando.
          </span>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => loadAllData()}>
            🔄 Tentar Novamente (Retry)
          </button>
        </div>
      )}

      {/* Notificação de feedback em tempo real (RNF 007 / REQ 012) */}
      {feedback && (
        <div className={`toast-notification toast-${feedback.type}`} role="status">
          <span>{feedback.message}</span>
          <button
            type="button"
            className="toast-close"
            onClick={() => setFeedback(null)}
            aria-label="Fechar notificação"
          >
            ✕
          </button>
        </div>
      )}

      <main className="main-content">
        {activeTab === 'crud' && (
          <PredictionsCrudPage
            currentUser={currentUser}
            games={games}
            predictions={predictions}
            onCreatePrediction={handleCreatePrediction}
            onUpdatePrediction={handleUpdatePrediction}
            onDeletePrediction={handleDeletePrediction}
            onNavigateToGames={() => setActiveTab('games')}
          />
        )}

        {activeTab === 'games' && (
          <GamesRoundPage
            games={games}
            onSyncNflGames={handleSyncNflGames}
            onCreateGame={handleCreateGame}
            onUpdateGame={handleUpdateGame}
            onDeleteGame={handleDeleteGame}
          />
        )}

        {activeTab === 'ranking' && (
          <RankingPage currentUser={currentUser} refreshTrigger={refreshTrigger} />
        )}

        {activeTab === 'profile' && (
          <ProfileAndAuthPage
            currentUser={currentUser}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onUpdateProfile={handleUpdateProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          🏈 <strong>Palpitando NFL</strong> • Engenharia de Software (2º Ano) • React + Express +
          MVC + Sequelize ORM + PostgreSQL + Swagger + Promises
        </p>
      </footer>
    </div>
  );
}
