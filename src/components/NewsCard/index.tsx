import { Link } from 'react-router-dom';
import { Eye, Star } from 'lucide-react';
import type { News } from '../../types';
import './newsCard.css';

interface NewsCardProps {
  news: News;
  variant?: 'featured' | 'grid' | 'compact';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function NewsCard({ news, variant = 'grid' }: NewsCardProps) {
  return (
    <Link to={`/noticia/${news.id}`} className={`news-card news-card-${variant}`}>
      <div className="news-card-image-wrapper">
        {news.coverImageUrl ? (
          <img src={news.coverImageUrl} alt={news.title} className="news-card-image" />
        ) : (
          <div className="news-card-image news-card-image-placeholder" aria-hidden />
        )}
        <span className="news-card-category">{news.groupName}</span>
        {variant !== 'compact' && (
          <span className="news-card-readtime">
            <Eye size={12} strokeWidth={2.5} />
            {news.readTimeMinutes} min
          </span>
        )}
      </div>

      <div className="news-card-body">
        <h3 className="news-card-title">{news.title}</h3>

        {variant !== 'compact' && <p className="news-card-excerpt">{news.excerpt}</p>}

        {variant !== 'compact' && (
          <div className="news-card-meta">
            <span className="news-card-author">
              <span className="news-card-author-avatar">
                <Star size={11} strokeWidth={2.5} />
              </span>
              {news.author}
            </span>
            <span className="news-card-date">{formatDate(news.publishedAt)}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
