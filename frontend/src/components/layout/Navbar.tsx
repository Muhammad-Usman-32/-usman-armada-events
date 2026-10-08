import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const appName = import.meta.env.VITE_APP_NAME || 'Armada Events';
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        {appName}
      </Link>

      <nav className="navbar-links">
        {user ? (
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
              end
            >
              Events
            </NavLink>
            <NavLink
              to="/events/new"
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              + Create Event
            </NavLink>
            <NavLink
              to="/rsvps"
              className={({ isActive }) =>
                isActive ? 'navbar-link active' : 'navbar-link'
              }
            >
              My RSVPs
            </NavLink>

            <div className="navbar-user">
              {user.avatar && !avatarError ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="navbar-avatar"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div
                  className="navbar-avatar"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.name}</span>
                <span className="navbar-user-email">{user.email}</span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  className="navbar-btn-logout"
                  onClick={onLogout}
                >
                  Logout
                </button>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="navbar-link">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};
