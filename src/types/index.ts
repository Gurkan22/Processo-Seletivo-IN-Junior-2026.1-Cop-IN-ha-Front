export interface Team {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  groupId: string;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  capacity: number;
}

export interface GroupStanding {
  team: Team;
  played: number; 
  wins: number; 
  draws: number; 
  losses: number; 
  goalsFor: number; 
  goalsAgainst: number; 
  goalDifference: number; 
  points: number; 
  qualified: boolean; 
}

export interface Group {
  id: string;
  name: string; 
  createdAt: string;
  teams: Team[];
  standings: GroupStanding[];
}

export type MatchStatus = 'scheduled' | 'ongoing' | 'finished';

export interface Match {
  id: string;
  groupId: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  date: string;
  stadium: {
    id: string;
    name: string;
    city: string;
  };
}

export type SimulatedOutcome = 'home' | 'draw' | 'away';

export interface SimulatedMatchChoice {
  matchId: string;
  outcome: SimulatedOutcome;
}


export interface News {
  id: string;
  groupId: string; 
  groupName: string; 
  title: string;
  subtitle: string;
  excerpt: string; 
  body: string[]; 
  author: string;
  publishedAt: string;
  coverImageUrl: string | null;
  readTimeMinutes: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
}
