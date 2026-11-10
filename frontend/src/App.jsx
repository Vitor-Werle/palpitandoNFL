import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AuthScreen from './pages/AuthScreen';
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
  const [activeTab, setActiveTab] = useState('palpites');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [games, setGames] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [feedback, setFeedback] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  const showToast = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev && prev.message === message ? null : prev));
    }, 4500);
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
          return null;
        });
      })
      .catch((error) => {
        setConnectionError(true);
        showToast('error', `Falha de conexão com o servidor: ${error.message}`);
      });
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== HANDLERS DE PALPITES ====================

  const handleCreatePrediction = (payload) => {
    return createPrediction(payload)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  const handleUpdatePrediction = (id, payload) => {
    return updatePrediction(id, payload)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  const handleDeletePrediction = (id) => {
    return deletePrediction(id)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  // ==================== HANDLERS DE JOGOS ====================

  const handleSyncNflGames = () => {
    return syncNflGames()
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null);
      })
      .catch((err) => {
        showToast('error', err.message);
      });
  };

  const handleCreateGame = (payload) => {
    return createGame(payload)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null);
      })
      .catch((err) => {
        showToast('error', err.message);
      });
  };

  const handleUpdateGame = (id, payload) => {
    return updateGame(id, payload)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  const handleDeleteGame = (id) => {
    return deleteGame(id)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(currentUser ? currentUser.id : null);
      })
      .catch((err) => {
        showToast('error', err.message);
      });
  };

  // ==================== HANDLERS DE AUTENTICAÇÃO E CONTA ====================

  const handleSelectUser = (userId) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast('info', `Conta ativa: ${found.username}`);
    }
  };

  const handleLogin = (credentials) => {
    return loginUser(credentials)
      .then((res) => {
        setCurrentUser(res.user);
        setActiveTab('palpites');
        showToast('success', `Bem-vindo(a), ${res.user.username}!`);
        return loadAllData(res.user.id);
      })
      .catch((err) => {
        showToast('error', err.message);
      });
  };

  const handleRegister = (payload) => {
    return registerUser(payload)
      .then((res) => {
        setCurrentUser(res.user);
        setActiveTab('palpites');
        showToast('success', res.message);
        return loadAllData(res.user.id).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  const handleUpdateProfile = (id, payload) => {
    return updateUser(id, payload)
      .then((res) => {
        showToast('success', res.message);
        return loadAllData(res.user.id);
      })
      .catch((err) => {
        showToast('error', err.message);
      });
  };

  const handleDeleteAccount = (id) => {
    return deleteUser(id)
      .then((res) => {
        showToast('success', res.message);
        setCurrentUser(null);
        return loadAllData(null).then(() => true);
      })
      .catch((err) => {
        showToast('error', err.message);
        return false;
      });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('info', 'Sessão encerrada.');
  };

  return (
    <div className="app-shell">
      {connectionError && (
        <div className="connection-banner" role="alert">
          <span>Não foi possível conectar ao servidor em http://localhost:3001.</span>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => loadAllData(currentUser ? currentUser.id : null)}
          >
            Tentar Novamente
          </button>
        </div>
      )}

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

      {!currentUser ? (
        <AuthScreen
          users={users}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      ) : (
        <>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            users={users}
            onSelectUser={handleSelectUser}
            onLogout={handleLogout}
          />

          <main className="main-content">
            {activeTab === 'palpites' && (
              <PredictionsCrudPage
                currentUser={currentUser}
                games={games}
                predictions={predictions}
                onCreatePrediction={handleCreatePrediction}
                onUpdatePrediction={handleUpdatePrediction}
                onDeletePrediction={handleDeletePrediction}
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
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </main>

          <footer className="app-footer">
            <p>Palpitando NFL • Plataforma de Palpites e Ranking</p>
          </footer>
        </>
      )}
    </div>
  );
}
