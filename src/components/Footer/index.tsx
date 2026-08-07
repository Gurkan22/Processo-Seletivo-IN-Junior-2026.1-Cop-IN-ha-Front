import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <span className="footer-brand">
        COP<span className="footer-brand-accent">{'{IN}'}</span>HA © 2026
      </span>

      <div className="footer-right">
        <span className="footer-info">Copa do Mundo · Fase de Grupos</span>
        <Link to="/login" className="footer-admin-link">
          <Lock size={13} strokeWidth={2.25} />
          Área administrativa
        </Link>
      </div>
    </footer>
  );
}
