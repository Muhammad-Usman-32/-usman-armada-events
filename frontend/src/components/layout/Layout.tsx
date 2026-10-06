import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const appName = import.meta.env.VITE_APP_NAME || 'Armada Events';
  const year = new Date().getFullYear();

  return (
    <div className="layout-root">
      <Navbar user={user} onLogout={logout} />
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>&copy; {year} {appName}. All rights reserved.</p>
      </footer>
    </div>
  );
};
