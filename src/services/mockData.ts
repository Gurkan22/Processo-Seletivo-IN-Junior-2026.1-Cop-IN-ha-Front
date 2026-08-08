
import type { AdminUser, Group, Match, News, Stadium, Team } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

function getAuthToken(): string | null {
  try {
    const raw = localStorage.getItem('copinha-auth');
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      `Não foi possível conectar à API em ${API_URL}. Confirme se o back está rodando (npm run start:dev) e se VITE_API_URL está certo no .env.`,
    );
  }

  if (!res.ok) {
    let message = `Erro ${res.status} ao acessar a API.`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // resposta sem corpo
    }
    throw new Error(message);
  }

  if (res.status === 204) return null as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

interface ApiTeam {
  id: number;
  publicId: string;
  name: string;
  acronym: string;
  flag: string;
  groupId: number;
  group?: { id: number; publicId: string; name: string };
}

interface ApiGroup {
  id: number;
  publicId: string;
  name: string;
  teams?: ApiTeam[];
  createdAt: string;
}

interface ApiNews {
  id: number;
  publicId: string;
  title: string;
  summary: string;
  text: string;
  image: string;
  readingTime: number;
  author?: { email: string } | null;
  group?: { publicId: string; name: string } | null;
  groupId?: number | null;
  createdAt: string;
}

function mapTeam(t: ApiTeam): Team {
  return {
    id: t.publicId,
    name: t.name,
    code: t.acronym,
    flagUrl: t.flag,
    groupId: t.group?.publicId ?? String(t.groupId),
  };
}

function mapGroup(g: ApiGroup): Omit<Group, 'standings'> {
  return {
    id: g.publicId,
    name: g.name,
    createdAt: g.createdAt,
    teams: (g.teams ?? []).map(mapTeam),
  };
}

function mapNews(n: ApiNews): News {
  const paragraphs = n.text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    id: String(n.id),
    groupId: n.group?.publicId ?? (n.groupId != null ? String(n.groupId) : ''),
    groupName: n.group?.name ?? 'Geral',
    title: n.title,
    subtitle: n.summary,
    excerpt: n.summary,
    body: paragraphs.length > 0 ? paragraphs : [n.text],
    author: n.author?.email ?? 'Redação',
    publishedAt: n.createdAt,
    coverImageUrl: n.image || null,
    readTimeMinutes: n.readingTime,
  };
}

// --- Grupos ------------------------------------------------------------

export async function fetchGroups(): Promise<Omit<Group, 'standings'>[]> {
  const groups = await apiFetch<ApiGroup[]>('/groups');
  return groups.map(mapGroup);
}

export async function createGroupRequest(payload: {
  name: string;
  teamIds: string[];
}): Promise<Omit<Group, 'standings'>> {
  const group = await apiFetch<ApiGroup>('/groups', {
    method: 'POST',
    body: JSON.stringify({ name: payload.name.trim() }),
  });

  if (payload.teamIds.length > 0) {
    const allTeams = await apiFetch<ApiTeam[]>('/teams');
    await Promise.all(
      payload.teamIds.map((teamId) => {
        const current = allTeams.find((t) => t.publicId === teamId);
        if (!current) return Promise.resolve(null);
        return apiFetch(`/teams/${teamId}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: current.name,
            acronym: current.acronym,
            flag: current.flag,
            groupId: group.publicId,
          }),
        });
      }),
    );
  }

  cachedMatches = null;
  const finalGroup = await apiFetch<ApiGroup>(`/groups/${group.publicId}`);
  return mapGroup(finalGroup);
}

export async function deleteGroupRequest(id: string): Promise<void> {
  await apiFetch<void>(`/groups/${id}`, { method: 'DELETE' });
  cachedMatches = null;
}

// --- Times ---------------------------------------------------------------

export async function fetchAllTeams(): Promise<Team[]> {
  const teams = await apiFetch<ApiTeam[]>('/teams');
  return teams.map(mapTeam);
}

const countryCodes: Record<string, string> = {
  'QAT': 'qa',
  'ECU': 'ec',
  'SEN': 'sn',
  'NED': 'nl',
  'ENG': 'gb-eng',
  'IRN': 'ir',
  'USA': 'us',
  'WAL': 'gb-wls',
  'ARG': 'ar',
  'KSA': 'sa',
  'MEX': 'mx',
  'POL': 'pl',
  'FRA': 'fr',
  'AUS': 'au',
  'DEN': 'dk',
  'TUN': 'tn',
  'ESP': 'es',
  'CRC': 'cr',
  'GER': 'de',
  'JPN': 'jp',
  'BEL': 'be',
  'CAN': 'ca',
  'MAR': 'ma',
  'CRO': 'hr',
  'BRA': 'br',
  'SRB': 'rs',
  'SUI': 'ch',
  'CMR': 'cm',
  'POR': 'pt',
  'GHA': 'gh',
  'URU': 'uy',
  'KOR': 'kr',
};

export async function createTeamRequest(payload: {
  name: string;
  code: string;
  groupId: string;
}): Promise<Team> {
  const acronym = payload.code.trim().toUpperCase();
  
  const flagCode = countryCodes[acronym] ?? acronym.substring(0, 2).toLowerCase();

  const team = await apiFetch<ApiTeam>('/teams', {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name.trim(),
      acronym: acronym,
      flag: `https://flagcdn.com/w80/${flagCode}.png`,
      groupId: payload.groupId,
    }),
  });
  
  cachedMatches = null;
  return mapTeam(team);
}

export async function deleteTeamRequest(id: string): Promise<void> {
  await apiFetch<void>(`/teams/${id}`, { method: 'DELETE' });
  cachedMatches = null;
}

// --- Notícias --------------------------------------------------------------

export async function fetchLatestNews(limit?: number): Promise<News[]> {
  const news = await apiFetch<ApiNews[]>('/news');
  const mapped = news.map(mapNews);
  return limit ? mapped.slice(0, limit) : mapped;
}

export async function fetchNewsById(id: string): Promise<News | null> {
  try {
    const news = await apiFetch<ApiNews | null>(`/news/${id}`);
    return news ? mapNews(news) : null;
  } catch {
    return null;
  }
}

export async function fetchRelatedNews(newsId: string, limit = 3): Promise<News[]> {
  const news = await apiFetch<ApiNews[]>(`/news/${newsId}/related`);
  return news.slice(0, limit).map(mapNews);
}

export async function deleteNewsRequest(id: string): Promise<void> {
  await apiFetch<void>(`/news/${id}`, { method: 'DELETE' });
}

// --- Autenticação ----------------------------------------------------------

export async function loginRequest(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const { token, user: apiUser } = await apiFetch<{ token: string; user: { id: string; email: string } }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const user: AdminUser = { id: apiUser.id, name: apiUser.email.split('@')[0], email: apiUser.email };
  return { token, user };
}

// --- Jogos / Simulador / Estádios ------------------------------------


let mockStadiums: Stadium[] = [
  { id: 's1', name: 'Maracanã', city: 'Rio de Janeiro', capacity: 78838 },
  { id: 's2', name: 'Beira-Rio', city: 'Porto Alegre', capacity: 50128 },
];

let cachedMatches: Match[] | null = null;

const FIXTURE_SCORES: Array<[number, number] | null> = [[3, 1], [1, 1], [2, 1], [2, 2], [1, 0], null, null, null];

async function ensureMatches(): Promise<Match[]> {
  if (cachedMatches) return cachedMatches;

  const groups = await fetchGroups();
  const matches: Match[] = [];
  let counter = 0;

  for (const group of groups) {
    for (let i = 0; i + 1 < group.teams.length; i += 2) {
      const score = FIXTURE_SCORES[counter % FIXTURE_SCORES.length];
      counter += 1;
      matches.push({
        id: `m-${counter}`,
        groupId: group.id,
        homeTeam: group.teams[i],
        awayTeam: group.teams[i + 1],
        homeScore: score ? score[0] : null,
        awayScore: score ? score[1] : null,
        status: score ? 'finished' : 'scheduled',
        date: new Date(Date.now() - counter * 86400000).toISOString(),
        stadium: mockStadiums[counter % mockStadiums.length],
      });
    }
  }

  cachedMatches = matches;
  return matches;
}

export async function fetchMatches(): Promise<Match[]> {
  return ensureMatches();
}

export async function fetchLatestResult(): Promise<Match | null> {
  const matches = await ensureMatches();
  const finished = matches.filter((m) => m.status === 'finished');
  if (finished.length === 0) return null;
  return [...finished].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

export async function createMatchRequest(payload: {
  groupId: string;
  homeTeamId: string;
  awayTeamId: string;
  stadiumId: string;
  date: string;
}): Promise<Match> {
  const matches = await ensureMatches();
  const teams = await fetchAllTeams();
  const homeTeam = teams.find((t) => t.id === payload.homeTeamId);
  const awayTeam = teams.find((t) => t.id === payload.awayTeamId);
  if (!homeTeam || !awayTeam) throw new Error('Selecione os dois times da partida.');

  const match: Match = {
    id: `m-${Date.now()}`,
    groupId: payload.groupId,
    homeTeam,
    awayTeam,
    homeScore: null,
    awayScore: null,
    status: 'scheduled',
    date: payload.date,
    stadium: mockStadiums.find((s) => s.id === payload.stadiumId) ?? mockStadiums[0],
  };
  matches.push(match);
  return match;
}

export async function deleteMatchRequest(id: string): Promise<void> {
  const matches = await ensureMatches();
  cachedMatches = matches.filter((m) => m.id !== id);
}

export async function fetchStadiums(): Promise<Stadium[]> {
  return mockStadiums;
}

export async function deleteStadiumRequest(id: string): Promise<void> {
  mockStadiums = mockStadiums.filter((s) => s.id !== id);
}
