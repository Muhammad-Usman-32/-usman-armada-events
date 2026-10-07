import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { EventsListPage } from './pages/EventsListPage';
import { EventFormPage } from './pages/EventFormPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyRsvpsPage } from './pages/MyRsvpsPage';

export const App: React.FC = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<Layout />}>
              <Route element={<ProtectedRoute />}>
                <Route index element={<EventsListPage />} />
                <Route path="events/new" element={<EventFormPage />} />
                <Route path="events/:id" element={<EventDetailPage />} />
                <Route path="events/:id/edit" element={<EventFormPage />} />
                <Route path="my-rsvps" element={<MyRsvpsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
