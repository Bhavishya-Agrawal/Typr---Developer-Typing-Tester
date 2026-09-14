import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Terminal, LogOut, Trophy, User as UserIcon, Code2 } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Terminal size={22} strokeWidth={2.5} />
          </div>
          <span>Typr_</span>
          <span className="brand-badge">MERN</span>
        </Link>

        {/* Center Nav Links */}
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Practice
          </Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
            Leaderboard
          </Link>
          {user && (
            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
              Profile & Stats
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="user-badge" title="View your profile & test history">
                <div className="user-avatar-circle">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="btn-pill-ghost"
                style={{ padding: '0.45rem 0.8rem' }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login" className="btn-pill-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-pill-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
