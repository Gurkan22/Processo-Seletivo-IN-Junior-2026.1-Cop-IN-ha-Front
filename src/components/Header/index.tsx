import { NavLink, useLocation } from 'react-router-dom';
import { Newspaper, TrendingUp, Calendar, Zap, Trophy } from 'lucide-react';
import './header.css';

const NAV_ITEMS = [
  { to: '/', label: 'Notícias', icon: Newspaper },
  { to: '/grupos', label: 'Grupos', icon: TrendingUp },
  { to: '/jogos', label: 'Jogos', icon: Calendar },
  { to: '/simulador', label: 'Simulador', icon: Zap },
];

export function Header() {
  const { pathname } = useLocation();

  function isNavItemActive(to: string): boolean {
    if (to === '/') return pathname === '/' || pathname.startsWith('/noticia');
    return pathname.startsWith(to);
  }

  return (
    <header className="header">
      <NavLink to="/" className="header-logo" aria-label="Cop{IN}ha - página inicial">
        <span className="header-logo-badge">
          <Trophy size={20} strokeWidth={2} />
        </span>
        <span className="header-logo-text">
          COP<span className="header-logo-accent">{'{IN}'}</span>HA
        </span>
      </NavLink>

      <nav className="header-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={`header-nav-link${isNavItemActive(to) ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
