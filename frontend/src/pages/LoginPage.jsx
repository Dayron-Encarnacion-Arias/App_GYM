import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, Lock, Mail, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(msg);
    }
  };

  const handleUseDemo = () => {
    setEmail('demo@gymflow.com');
    setPassword('GymPass123!');
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '36px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            className="nav-logo-badge"
            style={{ width: '48px', height: '48px', margin: '0 auto 16px' }}
          >
            <Dumbbell size={28} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Bienvenido a GymFlow
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Planifica tus rutinas, agenda tus días de entrenamiento y descansos
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@gymflow.com"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                required
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={handleUseDemo}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', marginBottom: '14px', gap: '6px' }}
          >
            <Sparkles size={16} style={{ color: 'var(--primary)' }} />
            <span>Llenar con Credenciales Demo</span>
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            ¿Aún no tienes cuenta?{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
