import React from 'react';
import { Link } from 'react-router-dom';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📅',
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
}) => {
  return (
    <div className="empty-state-box">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionLink && actionText && (
        <Link to={actionLink} className="btn-primary">
          {actionText}
        </Link>
      )}
      {!actionLink && onActionClick && actionText && (
        <button type="button" className="btn-primary" onClick={onActionClick}>
          {actionText}
        </button>
      )}
    </div>
  );
};
