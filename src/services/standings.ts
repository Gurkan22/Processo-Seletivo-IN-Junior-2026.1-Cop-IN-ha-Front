import type { Group, GroupStanding, Match, Team } from '../types';

const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSS = 0;

interface TeamAccumulator {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

function createEmptyAccumulator(team: Team): TeamAccumulator {
  return {
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

function applyMatchResult(
  acc: Record<string, TeamAccumulator>,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
) {
  const home = acc[homeTeamId];
  const away = acc[awayTeamId];
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.goalsFor += homeScore;
  home.goalsAgainst += awayScore;
  away.goalsFor += awayScore;
  away.goalsAgainst += homeScore;

  if (homeScore > awayScore) {
    home.wins += 1;
    away.losses += 1;
  } else if (homeScore < awayScore) {
    away.wins += 1;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
  }
}

function toStanding(acc: TeamAccumulator): Omit<GroupStanding, 'qualified'> {
  return {
    team: acc.team,
    played: acc.played,
    wins: acc.wins,
    draws: acc.draws,
    losses: acc.losses,
    goalsFor: acc.goalsFor,
    goalsAgainst: acc.goalsAgainst,
    goalDifference: acc.goalsFor - acc.goalsAgainst,
    points: acc.wins * POINTS_WIN + acc.draws * POINTS_DRAW + acc.losses * POINTS_LOSS,
  };
}

function breakTieByHeadToHead(
  tiedStandings: Omit<GroupStanding, 'qualified'>[],
  matches: Match[],
): Omit<GroupStanding, 'qualified'>[] {
  const tiedIds = new Set(tiedStandings.map((s) => s.team.id));

  const headToHeadAcc: Record<string, TeamAccumulator> = {};
  tiedStandings.forEach((s) => {
    headToHeadAcc[s.team.id] = createEmptyAccumulator(s.team);
  });

  matches
    .filter(
      (m) =>
        m.status === 'finished' &&
        m.homeScore != null &&
        m.awayScore != null &&
        tiedIds.has(m.homeTeam.id) &&
        tiedIds.has(m.awayTeam.id),
    )
    .forEach((m) => {
      applyMatchResult(headToHeadAcc, m.homeTeam.id, m.awayTeam.id, m.homeScore!, m.awayScore!);
    });

  const headToHeadStandings = Object.values(headToHeadAcc).map(toStanding);

  return [...tiedStandings].sort((a, b) => {
    const h2hA = headToHeadStandings.find((s) => s.team.id === a.team.id)!;
    const h2hB = headToHeadStandings.find((s) => s.team.id === b.team.id)!;

    if (h2hB.points !== h2hA.points) return h2hB.points - h2hA.points;
    if (h2hB.goalDifference !== h2hA.goalDifference) return h2hB.goalDifference - h2hA.goalDifference;
    if (h2hB.goalsFor !== h2hA.goalsFor) return h2hB.goalsFor - h2hA.goalsFor;
    return 0;
  });
}

export function calculateGroupStandings(
  teams: Team[],
  matches: Match[],
  qualifiedCount = 2,
): GroupStanding[] {
  const acc: Record<string, TeamAccumulator> = {};
  teams.forEach((t) => {
    acc[t.id] = createEmptyAccumulator(t);
  });

  matches
    .filter((m) => m.status === 'finished' && m.homeScore != null && m.awayScore != null)
    .forEach((m) => {
      applyMatchResult(acc, m.homeTeam.id, m.awayTeam.id, m.homeScore!, m.awayScore!);
    });

  const standings = Object.values(acc).map(toStanding);

  const byPoints = [...standings].sort((a, b) => b.points - a.points);

  const resolved: Omit<GroupStanding, 'qualified'>[] = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++;

    const tiedGroup = byPoints.slice(i, j);
    if (tiedGroup.length === 1) {
      resolved.push(tiedGroup[0]);
    } else {
      const afterHeadToHead = breakTieByHeadToHead(tiedGroup, matches);
      const afterGeneral = [...afterHeadToHead].sort((a, b) => {
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
      resolved.push(...afterGeneral);
    }
    i = j;
  }

  return resolved.map((s, index) => ({
    ...s,
    qualified: index < qualifiedCount,
  }));
}

export function buildGroupWithStandings(group: Group, matches: Match[], qualifiedCount = 2): Group {
  return {
    ...group,
    standings: calculateGroupStandings(group.teams, matches, qualifiedCount),
  };
}
