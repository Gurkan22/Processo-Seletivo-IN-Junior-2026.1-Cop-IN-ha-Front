import { useEffect, useMemo, useState } from 'react';
import { fetchGroups, fetchMatches, fetchLatestResult } from '../../services/mockData';
import { PageHero } from '../../components/PageHero';
import { SectionTitle } from '../../components/SectionTitle';
import { GameCard } from '../../components/GameCard';
import type { Group, Match } from '../../types';
import './jogos.css';

type StatusFilter = 'todos' | 'encerrados' | 'proximos';

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'encerrados', label: 'Encerrados' },
  { value: 'proximos', label: 'Próximos' },
];

export function Jogos() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('todos');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [matchesData, groupsData, latest] = await Promise.all([
          fetchMatches(),
          fetchGroups(),
          fetchLatestResult(),
        ]);
        setMatches(matchesData);
        setGroups(groupsData);
        setLatestResult(latest);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const groupNameById = useMemo(
    () => new Map(groups.map((g) => [g.id, g.name])),
    [groups],
  );

  const latestResultGroup = groups.find((g) => g.id === latestResult?.groupId);

  const filteredMatches = useMemo(() => {
    const sorted = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (filter === 'encerrados') return sorted.filter((m) => m.status === 'finished');
    if (filter === 'proximos') return sorted.filter((m) => m.status !== 'finished');
    return sorted;
  }, [matches, filter]);

  return (
    <div className="jogos-page">
      <PageHero latestResult={latestResult} latestResultGroupName={latestResultGroup?.name} />

      <section className="jogos-section">
        <SectionTitle>Jogos</SectionTitle>

        <div className="jogos-filters">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`jogos-filter-btn${filter === value ? ' active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="jogos-loading">Carregando...</p>
        ) : filteredMatches.length === 0 ? (
          <p className="jogos-loading">Nenhum jogo encontrado para esse filtro.</p>
        ) : (
          <div className="jogos-grid">
            {filteredMatches.map((match) => (
              <GameCard key={match.id} match={match} groupName={groupNameById.get(match.groupId) ?? ''} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
