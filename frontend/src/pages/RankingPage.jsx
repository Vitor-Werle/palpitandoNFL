import React, { useState, useEffect } from 'react';
import { fetchRanking } from '../services/api';
import { NFL_TEAMS, BRAZIL_STATES } from '../utils/nflConstants';

export default function RankingPage({ currentUser, refreshTrigger }) {
  const [rankingList, setRankingList] = useState([]);
  const [filterState, setFilterState] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [includeIneligible, setIncludeIneligible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchRanking({
      state: filterState,
      favoriteTeam: filterTeam,
      includeIneligible
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
  }, [filterState, filterTeam, includeIneligible, refreshTrigger]);

  return (
    <div className="page-container">
      <section className="eval-banner">
        <div>
          <h2>🏆 Classificação Geral da Temporada (Top 100 - RN11 a RN15 / REQ 014)</h2>
          <p>
            Pontuação calculada automaticamente: <strong>+1 pt</strong> por acerto de vencedor
            (RN02), <strong>-1 pt</strong> por erro (RN02.1), <strong>+3 pts extras</strong> por
            placar exato (RN06) e <strong>0 pt</strong> em caso de empate (RN03).
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card-header-flex">
          <h3>Filtros de Classificação (RN13)</h3>
          <div className="filter-bar">
            <select
              aria-label="Filtrar ranking por Estado UF"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="ALL">🌎 Todos os Estados (Ranking Geral)</option>
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
              <option value="ALL">🏈 Todos os Times da NFL</option>
              {NFL_TEAMS.map((t) => (
                <option key={t.abbr} value={t.abbr}>
                  Torcedores: {t.abbr} ({t.name})
                </option>
              ))}
            </select>

            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={includeIneligible}
                onChange={(e) => setIncludeIneligible(e.target.checked)}
              />
              Exibir cadastrados após início da temporada (RN15)
            </label>
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
              Tabela de classificação dos 100 melhores colocados na plataforma Palpitando NFL
            </caption>
            <thead>
              <tr>
                <th>Posição / Usuário</th>
                <th>Estado (UF)</th>
                <th>Time do Coração</th>
                <th>Acertos / Erros</th>
                <th>Placares Exatos (+3)</th>
                <th>Pontuação Total</th>
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
                  const medal =
                    index === 0 ? '🥇 1º' : index === 1 ? '🥈 2º' : index === 2 ? '🥉 3º' : `${index + 1}º`;

                  return (
                    <tr key={u.id} className={isCurrentUser ? 'highlight-row' : ''}>
                      <th>
                        <span className="rank-pos">{medal}</span>{' '}
                        <strong>{u.username}</strong>
                        {isCurrentUser && <span className="you-tag">Você</span>}
                        {!u.eligibleForRanking && (
                          <span className="sub-meta">(Fora do Ranking Oficial - RN15)</span>
                        )}
                      </th>
                      <td>{u.state}</td>
                      <td>
                        <span className="team-pill">{u.favoriteTeam}</span>
                      </td>
                      <td>
                        <span className="text-success">{u.hits} V</span> /{' '}
                        <span className="text-danger">{u.misses} D</span>
                      </td>
                      <td>🎯 {u.exactScores}</td>
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
