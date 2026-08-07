import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Newspaper, Layers, Shield, Calendar, Landmark, LogOut, Trophy } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import './adminSidebar.css';

interface AdminSidebarProps {
  counts: {
    noticias: number;
    grupos: number;
    times: number;
    jogos: number;
    estadios: number;
  };
}

const NAV_ITEMS = (counts: AdminSidebarProps['counts']) => [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, count: null, end: true },
  { to: '/admin/noticias', label: 'Notícias', icon: Newspaper, count: counts.noticias, end: false },
  { to: '/admin/grupos', label: 'Grupos', icon: Layers, count: counts.grupos, end: false },
  { to: '/admin/times', label: 'Times', icon: Shield, count: counts.times, end: false },
  { to: '/admin/jogos', label: 'Jogos', icon: Calendar, count: counts.jogos, end: false },
  { to: '/admin/estadios', label: 'Estádios', icon: Landmark, count: counts.estadios, end: false },
];

export function AdminSidebar({ counts }: AdminSidebarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand-row">
          <span className="admin-sidebar-logo">
            <Trophy size={20} strokeWidth={2} />
          </span>
          <div>
            <span className="admin-sidebar-title">
              COP<span className="admin-sidebar-title-accent">{'{IN}'}</span>HA
            </span>
            <span className="admin-sidebar-subtitle">Painel Admin</span>
          </div>
        </div>

        {user && (
          <div className="admin-sidebar-user">
            <span className="admin-sidebar-user-name">{user.name}</span>
            <span className="admin-sidebar-user-email">{user.email}</span>
          </div>
        )}
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS(counts).map(({ to, label, icon: Icon, count, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} strokeWidth={2.25} />
            <span className="admin-sidebar-link-label">{label}</span>
            {count != null && <span className="admin-sidebar-link-count">{count}</span>}
          </NavLink>
        ))}
      </nav>

      <button type="button" className="admin-sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} strokeWidth={2.25} />
        Sair da conta
      </button>
    </aside>
  );
}
