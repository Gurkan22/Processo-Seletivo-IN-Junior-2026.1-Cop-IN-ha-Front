import { MapPin } from 'lucide-react';
import type { Match } from '../../types';
import './gameCard.css';

interface GameCardProps {
  match: Match;
  groupName: string;
}

export function GameCard({ match, groupName }: GameCardProps) {
  const isFinished = match.status === 'finished' && match.homeScore != null && match.awayScore != null;

  return (
    <div className="game-card">
      <div className="game-card-top">
        <span className="game-card-group">{groupName.toUpperCase()}</span>
        <span className="game-card-city">
          <MapPin size={12} strokeWidth={2.5} />
          {match.stadium.city}
        </span>
      </div>

      <div className="game-card-matchup">
        <div className="game-card-team">
          <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />
          <div>
            <span className="game-card-team-name">{match.homeTeam.name}</span>
            <span className="game-card-team-code">{match.homeTeam.code}</span>
          </div>
        </div>

        <div className="game-card-center">
          {isFinished ? (
            <span className="game-card-score">
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className="game-card-vs">VS</span>
          )}
        </div>

        <div className="game-card-team game-card-team-away">
          <div>
            <span className="game-card-team-name">{match.awayTeam.name}</span>
            <span className="game-card-team-code">{match.awayTeam.code}</span>
          </div>
          <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />
        </div>
      </div>

      <div className="game-card-stadium">
        <MapPin size={12} strokeWidth={2.5} />
        {match.stadium.name}
      </div>
    </div>
  );
}
