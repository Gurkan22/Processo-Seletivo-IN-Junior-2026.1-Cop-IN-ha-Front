import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Shield, CheckCircle2, Landmark } from 'lucide-react';
import { fetchLatestNews, fetchAllTeams, fetchGroups, fetchMatches, fetchStadiums } from '../../../services/mockData';
import { AdminPage } from '../../../components/AdminPage';
import type { Match, News } from '../../../types';
import './dashboard.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function AdminDashboard() {
  const [news, setNews] = useState<News[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamsCount, setTeamsCount] = useState(0);
  const [groupsCount, setGroupsCount] = useState(0);
  const [stadiumsCount, setStadiumsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [newsData, teams, groups, matchesData, stadiums] = await Promise.all([
          fetchLatestNews(),
          fetchAllTeams(),
          fetchGroups(),
          fetchMatches(),
          fetchStadiums(),
        ]);
        setNews(newsData);
        setTeamsCount(teams.length);
        setGroupsCount(groups.length);
        setMatches(matchesData);
        setStadiumsCount(stadiums.length);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const finishedMatches = matches.filter((m) => m.status === 'finished');
  const scheduledMatches = matches.filter((m) => m.status !== 'finished');
  const recentResults = [...finishedMatches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);
  const latestNews = news.slice(0, 5);

  return (
    <AdminPage title="Dashboard">
      {loading ? (
        <p className="admin-loading">Carregando...</p>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-yellow">
                <Newspaper size={18} strokeWidth={2.25} />
              </span>
              <strong>{news.length}</strong>
              <span>Notícias</span>
              <small>{news.length} com conteúdo</small>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-green">
                <Shield size={18} strokeWidth={2.25} />
              </span>
              <strong>{teamsCount}</strong>
              <span>Times</span>
              <small>{groupsCount} grupos</small>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-green">
                <CheckCircle2 size={18} strokeWidth={2.25} />
              </span>
              <strong>{finishedMatches.length}</strong>
              <span>Jogos realizados</span>
              <small>{scheduledMatches.length} agendados</small>
            </div>

            <div className="dashboard-stat-card">
              <span className="dashboard-stat-icon dashboard-stat-icon-purple">
                <Landmark size={18} strokeWidth={2.25} />
              </span>
              <strong>{stadiumsCount}</strong>
              <span>Estádios</span>
              <small>cadastrados</small>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <Newspaper size={15} strokeWidth={2.25} />
              ÚLTIMAS NOTÍCIAS
            </div>
            {latestNews.map((item) => (
              <Link key={item.id} to={`/noticia/${item.id}`} className="dashboard-news-row">
                {item.coverImageUrl ? (
                  <img src={item.coverImageUrl} alt="" />
                ) : (
                  <span className="dashboard-news-row-placeholder" />
                )}
                <div>
                  <span className="dashboard-news-row-title">{item.title}</span>
                  <span className="dashboard-news-row-meta">
                    {item.author} · {item.readTimeMinutes} min leitura
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">RESULTADOS RECENTES</div>
            {recentResults.map((match) => (
              <div key={match.id} className="dashboard-result-row">
                <span className="dashboard-result-team">
                  <img src={match.homeTeam.flagUrl} alt="" />
                  {match.homeTeam.code}
                </span>
                <span className="dashboard-result-score">
                  {match.homeScore} – {match.awayScore}
                </span>
                <span className="dashboard-result-team dashboard-result-team-away">
                  {match.awayTeam.code}
                  <img src={match.awayTeam.flagUrl} alt="" />
                </span>
                <span className="dashboard-result-date">{formatDate(match.date)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminPage>
  );
}
