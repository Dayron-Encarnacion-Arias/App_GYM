import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Dumbbell, Calendar, Database, LogOut, Sun, Moon } from 'lucide-react';
import NotificationsBell from './NotificationsBell';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="nav-brand">
          <div className="nav-logo-badge">
            <Dumbbell size={22} />
          </div>
          <span>GymFlow</span>
        </NavLink>

        {isAuthenticated && (
          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Agendamiento Semanal</span>
            </NavLink>

            <NavLink
              to="/exercises"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Dumbbell size={18} />
              <span>Banco de Ejercicios (CRUD)</span>
            </NavLink>

            <NavLink
              to="/workouts"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Database size={18} />
              <span>Rutinas (SQL Server)</span>
            </NavLink>
          </nav>
        )}

        <div className="nav-user">
          {/* Botón de Cambio de Tema (Oscuro / Claro) */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={19} style={{ color: '#fbbf24' }} /> : <Moon size={19} style={{ color: '#6366f1' }} />}
          </button>

          {isAuthenticated ? (
            <>
              <NotificationsBell />

              <div className="user-badge">
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm"
                title="Cerrar Sesión"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <NavLink to="/login" className="btn btn-secondary btn-sm">
                Iniciar Sesión
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Registrarse
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
