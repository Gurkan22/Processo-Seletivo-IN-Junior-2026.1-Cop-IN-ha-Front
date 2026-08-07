import type { Match } from '../../types';
import { ResultBanner } from '../ResultBanner';
import './pageHero.css';

interface PageHeroProps {
  latestResult: Match | null;
  latestResultGroupName?: string;
}

export function PageHero({ latestResult, latestResultGroupName }: PageHeroProps) {
  return (
    <div className="page-hero">
      <div className="page-hero-text">
        <span className="page-hero-eyebrow">★ COPA DO MUNDO 2026 — FASE DE GRUPOS</span>
        <h1 className="page-hero-title">
          COP<span className="page-hero-accent">{'{IN}'}</span>HA
        </h1>
        <p className="page-hero-subtitle">Notícias, placar e tabela da Copa do Mundo em um só lugar</p>
      </div>

      <ResultBanner match={latestResult} groupName={latestResultGroupName} />
    </div>
  );
}
