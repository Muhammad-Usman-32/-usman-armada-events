import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message-box">
      <div className="error-message-content">
        <span>⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <button type="button" className="error-message-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};
