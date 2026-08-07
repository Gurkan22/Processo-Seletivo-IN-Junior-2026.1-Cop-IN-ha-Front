import { useEffect, useMemo, useState } from 'react';
import { fetchGroups, fetchMatches, fetchLatestResult } from '../../services/mockData';
import { buildGroupWithStandings } from '../../services/standings';
import { PageHero } from '../../components/PageHero';
import { SectionTitle } from '../../components/SectionTitle';
import { GroupTable } from '../../components/GroupTable';
import { MatchCard } from '../../components/MatchCard';
import type { Group, Match, SimulatedOutcome } from '../../types';
import './simulador.css';

function outcomeToScore(outcome: SimulatedOutcome): { homeScore: number; awayScore: number } {
  if (outcome === 'home') return { homeScore: 1, awayScore: 0 };
  if (outcome === 'away') return { homeScore: 0, awayScore: 1 };
  return { homeScore: 1, awayScore: 1 };
}

export function Simulador() {
  const [groupsBase, setGroupsBase] = useState<Omit<Group, 'standings'>[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const [simulatedChoices, setSimulatedChoices] = useState<Record<string, SimulatedOutcome>>({});

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [groups, matchesData, latest] = await Promise.all([
          fetchGroups(),
          fetchMatches(),
          fetchLatestResult(),
        ]);
        setGroupsBase(groups);
        setMatches(matchesData);
        setLatestResult(latest);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleSimulate = (matchId: string, outcome: SimulatedOutcome) => {
    setSimulatedChoices((current) => {
      if (current[matchId] === outcome) {
        const { [matchId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [matchId]: outcome };
    });
  };

  const matchesWithSimulation = useMemo<Match[]>(() => {
    return matches.map((match) => {
      const choice = simulatedChoices[match.id];
      if (!choice) return match;

      const { homeScore, awayScore } = outcomeToScore(choice);
      return { ...match, homeScore, awayScore, status: 'finished' as const };
    });
  }, [matches, simulatedChoices]);

  const groupsWithStandings = useMemo<Group[]>(() => {
    return groupsBase.map((group) =>
      buildGroupWithStandings(
        { ...group, standings: [] },
        matchesWithSimulation.filter((m) => m.groupId === group.id),
      ),
    );
  }, [groupsBase, matchesWithSimulation]);

  const latestResultGroup = groupsWithStandings.find((g) => g.id === latestResult?.groupId);

  return (
    <div className="simulador-page">
      <PageHero latestResult={latestResult} latestResultGroupName={latestResultGroup?.name} />

      <section className="simulador-section">
        <SectionTitle>Simulador</SectionTitle>

        {loading ? (
          <p className="simulador-loading">Carregando...</p>
        ) : (
          groupsWithStandings.map((group) => (
            <div key={group.id} className="simulador-group-block">
              {matchesWithSimulation
                .filter((m) => m.groupId === group.id)
                .map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onSimulate={(outcome) => handleSimulate(match.id, outcome)}
                    selectedOutcome={simulatedChoices[match.id] ?? null}
                  />
                ))}

              <GroupTable group={group} />
            </div>
          ))
        )}
      </section>
    </div>
  );
}
