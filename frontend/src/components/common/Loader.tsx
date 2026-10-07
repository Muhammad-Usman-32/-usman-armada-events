import React from 'react';
import './Loader.css';

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="spinner" />
      {label && <p className="loader-label">{label}</p>}
    </div>
  );
};
