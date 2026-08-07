import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { fetchNewsById, fetchRelatedNews } from '../../services/mockData';
import { NewsCard } from '../../components/NewsCard';
import { SectionTitle } from '../../components/SectionTitle';
import type { News } from '../../types';
import './noticia.css';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function Noticia() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [related, setRelated] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const current = await fetchNewsById(id!);
        if (!current) {
          setNotFound(true);
          setNews(null);
          return;
        }
        setNews(current);
        const relatedNews = await fetchRelatedNews(current.id, 3);
        setRelated(relatedNews);
      } finally {
        setLoading(false);
      }
    }

    load();
    window.scrollTo({ top: 0 });
  }, [id]);

  if (loading) {
    return (
      <div className="noticia-page">
        <p className="noticia-loading">Carregando...</p>
      </div>
    );
  }

  if (notFound || !news) {
    return (
      <div className="noticia-page">
        <div className="noticia-not-found">
          <p>Notícia não encontrada.</p>
          <Link to="/">Voltar para a Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="noticia-page">
      <article className="noticia-article">
        <div className="noticia-tags">
          <span className="noticia-category">{news.groupName}</span>
          <span className="noticia-readtime">
            <Clock size={13} strokeWidth={2.25} />
            {news.readTimeMinutes} min de leitura
          </span>
        </div>

        <h1 className="noticia-title">{news.title}</h1>

        <blockquote className="noticia-subtitle">{news.subtitle}</blockquote>

        <div className="noticia-author-row">
          <span className="noticia-author-avatar">
            <Star size={13} strokeWidth={2.5} />
          </span>
          <div>
            <span className="noticia-author-name">{news.author}</span>
            <span className="noticia-author-date">{formatDate(news.publishedAt)}</span>
          </div>
        </div>

        {news.coverImageUrl && (
          <img src={news.coverImageUrl} alt={news.title} className="noticia-cover" />
        )}

        <div className="noticia-body">
          {news.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      {related.length > 0 && (
        <section className="noticia-related">
          <SectionTitle>Mais Notícias</SectionTitle>
          <div className="noticia-related-grid">
            {related.map((item) => (
              <NewsCard key={item.id} news={item} variant="compact" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
