import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { loginSchema, formatZodErrors } from '../../utils/validation';
import { loginRequest } from '../../services/mockData';
import { useAuthStore } from '../../store/authStore';
import './login.css';

export function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldErrors(formatZodErrors(result.error));
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const { token, user } = await loginRequest(result.data.email, result.data.password);
      login(token, user);
      navigate('/admin');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Não foi possível fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="login-logo">
          COP<span className="login-logo-accent">{'{IN}'}</span>HA
        </Link>
      </header>

      <main className="login-main">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <span className="login-icon">
            <Lock size={22} strokeWidth={2} />
          </span>

          <h1 className="login-title">Acesso restrito</h1>
          <p className="login-subtitle">Painel administrativo · Cop{'{IN}'}ha</p>

          <div className="login-field">
            <label htmlFor="login-email">E-MAIL</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder="admin@copinha.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && <span className="login-field-error">{fieldErrors.email}</span>}
          </div>

          <div className="login-field">
            <label htmlFor="login-password">SENHA</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && <span className="login-field-error">{fieldErrors.password}</span>}
          </div>

          {formError && <div className="login-form-error">{formError}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" aria-hidden />
            ) : (
              <Lock size={16} strokeWidth={2.25} />
            )}
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>

          <p className="login-footnote">Acesso exclusivo para administradores</p>
        </form>
      </main>
    </div>
  );
}
