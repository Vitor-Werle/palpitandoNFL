const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Função auxiliar que encapsula o fetch retornando uma Promise explícita
 */
function request(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    })
      .then((response) => {
        return response.json().then((data) => {
          if (!response.ok) {
            const errorMessage = data.message || 'Erro na comunicação com o servidor Back-end.';
            throw new Error(errorMessage);
          }
          return data;
        });
      })
      .then((data) => resolve(data))
      .catch((error) => reject(error));
  });
}

// ==================== CRUD DE PALPITES (PREDICTIONS) ====================

export function fetchPredictions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.gameId) params.append('gameId', filters.gameId);
  if (filters.week) params.append('week', filters.week);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/predictions${query}`);
}

export function createPrediction(payload) {
  return request('/predictions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updatePrediction(id, payload) {
  return request(`/predictions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deletePrediction(id) {
  return request(`/predictions/${id}`, {
    method: 'DELETE'
  });
}

// ==================== JOGOS DA NFL (GAMES) ====================

export function fetchGames(week) {
  const query = week ? `?week=${week}` : '';
  return request(`/games${query}`);
}

export function createGame(payload) {
  return request('/games', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateGame(id, payload) {
  return request(`/games/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteGame(id) {
  return request(`/games/${id}`, {
    method: 'DELETE'
  });
}

export function syncNflGames() {
  return request('/games/sync', {
    method: 'POST'
  });
}

// ==================== USUÁRIOS E RANKING (USERS) ====================

export function fetchUsers() {
  return request('/users');
}

export function fetchRanking(filters = {}) {
  const params = new URLSearchParams();
  if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
  if (filters.favoriteTeam && filters.favoriteTeam !== 'ALL') {
    params.append('favoriteTeam', filters.favoriteTeam);
  }
  if (filters.includeIneligible) {
    params.append('includeIneligible', 'true');
  }
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/users/ranking${query}`);
}

export function fetchUserStats(userId) {
  return request(`/users/${userId}/stats`);
}

export function loginUser(credentials) {
  return request('/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function registerUser(payload) {
  return request('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE'
  });
}
