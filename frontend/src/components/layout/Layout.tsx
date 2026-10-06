import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import './Layout.css';

interface LayoutProps {
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
  } | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const appName = import.meta.env.VITE_APP_NAME || 'Armada Events';
  const year = new Date().getFullYear();

  return (
    <div className="layout-root">
      <Navbar user={user} onLogout={onLogout} />
      <main className="layout-main">
        <Outlet />
      </main>
      <footer className="layout-footer">
        <p>&copy; {year} {appName}. All rights reserved.</p>
      </footer>
    </div>
  );
};
