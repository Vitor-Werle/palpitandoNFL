import React, { useState, useEffect } from 'react';
import { fetchRanking } from '../services/api';
import { NFL_TEAMS, BRAZIL_STATES } from '../utils/nflConstants';

export default function RankingPage({ currentUser, refreshTrigger }) {
  const [rankingList, setRankingList] = useState([]);
  const [filterState, setFilterState] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRanking({
      state: filterState,
      favoriteTeam: filterTeam,
      includeIneligible: true
    })
      .then((data) => {
        setRankingList(data);
      })
      .catch((err) => {
        console.error('Erro ao buscar ranking:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filterState, filterTeam, refreshTrigger]);

  return (
    <div className="page-container">
      <section className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="section-title">Classificação Geral</h2>
            <p className="muted-text">
              +1 ponto por vencedor correto • -1 ponto por erro • +3 pontos bônus por placar exato
            </p>
          </div>

          <div className="filter-bar">
            <select
              aria-label="Filtrar ranking por Estado UF"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="ALL">Todos os Estados</option>
              {BRAZIL_STATES.map((uf) => (
                <option key={uf} value={uf}>
                  Estado: {uf}
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar ranking por Time Favorito da NFL"
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
            >
              <option value="ALL">Todos os Times</option>
              {NFL_TEAMS.map((t) => (
                <option key={t.abbr} value={t.abbr}>
                  {t.abbr} - {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          tabIndex="0"
          role="region"
          aria-labelledby="ranking-table-caption"
          className="table-wrapper"
        >
          <table className="responsive-data-table ranking-table">
            <caption id="ranking-table-caption" className="sr-only">
              Tabela de classificação da plataforma Palpitando NFL
            </caption>
            <thead>
              <tr>
                <th>Posição / Usuário</th>
                <th>Estado</th>
                <th>Time Favorito</th>
                <th>Acertos / Erros</th>
                <th>Placares Exatos</th>
                <th>Pontuação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Carregando classificação...
                  </td>
                </tr>
              ) : rankingList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Nenhum usuário encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                rankingList.map((u, index) => {
                  const isCurrentUser = currentUser && currentUser.id === u.id;
                  const posLabel = `${index + 1}º`;

                  return (
                    <tr key={u.id} className={isCurrentUser ? 'highlight-row' : ''}>
                      <th>
                        <span className="rank-pos">{posLabel}</span>{' '}
                        <strong>{u.username}</strong>
                        {isCurrentUser && <span className="you-tag">Você</span>}
                      </th>
                      <td>{u.state}</td>
                      <td>
                        <span className="team-pill">{u.favoriteTeam}</span>
                      </td>
                      <td>
                        <span className="text-success">{u.hits} V</span> /{' '}
                        <span className="text-danger">{u.misses} D</span>
                      </td>
                      <td>{u.exactScores}</td>
                      <td>
                        <strong className="points-total">{u.points} pts</strong>
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
  );
}
