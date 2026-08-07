import type { Match, SimulatedOutcome } from '../../types';
import './matchCard.css';

interface MatchCardProps {
  match: Match;
  onSimulate?: (outcome: SimulatedOutcome) => void;
  selectedOutcome?: SimulatedOutcome | null;
}

export function MatchCard({ match, onSimulate, selectedOutcome }: MatchCardProps) {
  const isFinished = match.status === 'finished' && match.homeScore != null && match.awayScore != null;

  return (
    <div className="match-card">
      <div className="match-card-team">
        <img src={match.homeTeam.flagUrl} alt={match.homeTeam.name} />
        <div>
          <span className="match-card-team-name">{match.homeTeam.name}</span>
          <span className="match-card-team-code">{match.homeTeam.code}</span>
        </div>
      </div>

      <div className="match-card-center">
        {isFinished ? (
          <>
            <span className="match-card-score">
              {match.homeScore}-{match.awayScore}
            </span>
            <span className="match-card-status">Encerrado</span>
          </>
        ) : (
          <span className="match-card-vs">VS</span>
        )}
      </div>

      <div className="match-card-team match-card-team-away">
        <div>
          <span className="match-card-team-name">{match.awayTeam.name}</span>
          <span className="match-card-team-code">{match.awayTeam.code}</span>
        </div>
        <img src={match.awayTeam.flagUrl} alt={match.awayTeam.name} />
      </div>

      {!isFinished && onSimulate && (
        <div className="match-card-simulate-buttons">
          <button
            type="button"
            className={`match-card-btn match-card-btn-home ${selectedOutcome === 'home' ? 'active' : ''}`}
            onClick={() => onSimulate('home')}
          >
            {match.homeTeam.name} Vitória
          </button>
          <button
            type="button"
            className={`match-card-btn match-card-btn-draw ${selectedOutcome === 'draw' ? 'active' : ''}`}
            onClick={() => onSimulate('draw')}
          >
            Empate
          </button>
          <button
            type="button"
            className={`match-card-btn match-card-btn-away ${selectedOutcome === 'away' ? 'active' : ''}`}
            onClick={() => onSimulate('away')}
          >
            {match.awayTeam.name} Vitória
          </button>
        </div>
      )}
    </div>
  );
}
