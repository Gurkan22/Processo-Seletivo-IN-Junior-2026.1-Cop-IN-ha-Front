import { useEffect, useState } from 'react';
import { fetchNewsPage, fetchLatestResult, fetchGroups, fetchMatches } from '../../services/mockData';
import { PageHero } from '../../components/PageHero';
import { SectionTitle } from '../../components/SectionTitle';
import { NewsCard } from '../../components/NewsCard';
import type { Group, Match, News } from '../../types';
import './home.css';

export function Home() {
  const [news, setNews] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [latestResult, setLatestResult] = useState<Match | null>(null);
  const [groups, setGroups] = useState<Omit<Group, 'standings'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [firstPage, latest, groupsData] = await Promise.all([
          fetchNewsPage(1),
          fetchLatestResult(),
          fetchGroups(),
          fetchMatches(),
        ]);

        setNews(firstPage.news);
        setHasMore(firstPage.hasMore);
        setLatestResult(latest);
        setGroups(groupsData);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await fetchNewsPage(nextPage);
      setNews((prev) => [...prev, ...result.news]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  }

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

            {hasMore && (
              <button type="button" className="home-load-more" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Carregando...' : 'Carregar mais notícias'}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
