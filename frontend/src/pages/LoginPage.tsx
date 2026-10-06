import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setErrorMessage('No ID token received from Google.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Google authentication failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google Sign-In was cancelled or failed to initialize.');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-card-title">Armada Events</h1>
        <p className="login-card-subtitle">
          Sign in with your Google account to explore events, RSVP, and manage your registrations.
        </p>

        {errorMessage && <div className="login-error">{errorMessage}</div>}

        <div className="login-button-wrapper">
          {isSubmitting ? (
            <div style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)' }}>
              Verifying credentials with server...
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              shape="rectangular"
              theme="outline"
              size="large"
              text="signin_with"
            />
          )}
        </div>

        <p className="login-footer-note">
          Secure OAuth 2.0 authentication. Your Google profile details (name, email, and avatar) will be synchronized.
        </p>
      </div>
    </div>
  );
};
