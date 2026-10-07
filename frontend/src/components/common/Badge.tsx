import React from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'default';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children }) => {
  return <span className={`badge badge-${variant}`}>{children}</span>;
};
