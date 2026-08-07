import { useEffect, useState } from 'react';
import { fetchGroups, fetchMatches, fetchLatestResult } from '../../services/mockData';
import { buildGroupWithStandings } from '../../services/standings';
import { PageHero } from '../../components/PageHero';
import { SectionTitle } from '../../components/SectionTitle';
import { GroupTable } from '../../components/GroupTable';
import type { Group, Match } from '../../types';
import './grupos.css';

export function Grupos() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [groupsBase, matches, latest] = await Promise.all([
          fetchGroups(),
          fetchMatches(),
          fetchLatestResult(),
        ]);

        const groupsWithStandings = groupsBase.map((group) =>
          buildGroupWithStandings({ ...group, standings: [] }, matches.filter((m) => m.groupId === group.id)),
        );

        setGroups(groupsWithStandings);
        setLatestResult(latest);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const latestResultGroup = groups.find((g) => g.id === latestResult?.groupId);

  return (
    <div className="grupos-page">
      <PageHero latestResult={latestResult} latestResultGroupName={latestResultGroup?.name} />

      <section className="grupos-section">
        <SectionTitle>Classificação dos Grupos</SectionTitle>

        {loading ? (
          <p className="grupos-loading">Carregando...</p>
        ) : (
          groups.map((group) => <GroupTable key={group.id} group={group} />)
        )}
      </section>
    </div>
  );
}
