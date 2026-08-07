import { useEffect, useState } from 'react';
import { fetchLatestNews, fetchLatestResult, fetchGroups, fetchMatches } from '../../services/mockData';
import { PageHero } from '../../components/PageHero';
import { SectionTitle } from '../../components/SectionTitle';
import { NewsCard } from '../../components/NewsCard';
import type { Group, Match, News } from '../../types';
import './home.css';

export function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [newsData, latest, groupsData] = await Promise.all([
          fetchLatestNews(5),
          fetchLatestResult(),
          fetchGroups(),
          fetchMatches(),
        ]);

        setNews(newsData);
        setLatestResult(latest);
        setGroups(groupsData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const latestResultGroup = groups.find((g) => g.id === latestResult?.groupId);
  const [featuredNews, ...restNews] = news;

  return (
    <div className="home-page">
      <PageHero latestResult={latestResult} latestResultGroupName={latestResultGroup?.name} />

      <section className="home-section">
        <SectionTitle>Últimas Notícias</SectionTitle>

        {loading ? (
          <p className="home-loading">Carregando...</p>
        ) : (
          <div className="home-news-layout">
            {featuredNews && <NewsCard news={featuredNews} variant="featured" />}

            <div className="home-news-grid">
              {restNews.map((item) => (
                <NewsCard key={item.id} news={item} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
