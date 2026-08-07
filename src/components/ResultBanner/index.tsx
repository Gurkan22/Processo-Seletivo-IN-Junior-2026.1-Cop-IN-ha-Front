import type { Match } from '../../types';
import './resultBanner.css';

interface ResultBannerProps {
  match: Match | null;
  groupName?: string;
}

export function ResultBanner({ match, groupName }: ResultBannerProps) {
  if (!match || match.homeScore == null || match.awayScore == null) {
    return null;
  }

  return (
    <div className="result-banner">
      <span className="result-banner-label">
        ÚLTIMO RESULTADO {groupName ? `· ${groupName.toUpperCase()}` : ''}
      </span>

      <div className="result-banner-content">
        <div className="result-banner-team">
          <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />
          <span>{match.homeTeam.code}</span>
        </div>

        <div className="result-banner-score">
          <span>{match.homeScore}</span>
          <span className="result-banner-x">×</span>
          <span>{match.awayScore}</span>
        </div>

        <div className="result-banner-team">
          <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />
          <span>{match.awayTeam.code}</span>
        </div>
      </div>

      <span className="result-banner-stadium">{match.stadium.name}</span>
    </div>
  );
}
