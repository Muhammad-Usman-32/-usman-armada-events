import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { RsvpItem } from '../types';
import './MyRsvpsPage.css';

export const MyRsvpsPage: React.FC = () => {
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMyRsvps = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<RsvpItem[]>('/rsvps/me');
      setRsvps(response.data);
    } catch (err: any) {
      console.error('Failed to load my RSVPs:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load your RSVPs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRsvps();
  }, []);

  const handleToggleRsvp = async (eventId: string, currentStatus: 'going' | 'cancelled') => {
    setActionLoadingId(eventId);
    try {
      if (currentStatus === 'going') {
        await api.delete(`/events/${eventId}/rsvp`);
      } else {
        await api.post(`/events/${eventId}/rsvp`);
      }
      // Refresh list
      const response = await api.get<RsvpItem[]>('/rsvps/me');
      setRsvps(response.data);
    } catch (err: any) {
      console.error('Failed to update RSVP:', err);
      alert(err.response?.data?.message || 'Failed to update RSVP.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div>
      <div className="rsvps-page-header">
        <h1>My RSVPs</h1>
        <p>Review and manage all events you have registered for.</p>
      </div>

      {isLoading ? (
        <div className="state-container">
          <div className="state-title">Loading your registrations...</div>
        </div>
      ) : errorMessage ? (
        <div className="state-container">
          <div className="state-title" style={{ color: 'var(--danger)' }}>
            Error Loading RSVPs
          </div>
          <p className="state-desc">{errorMessage}</p>
          <button type="button" className="btn-secondary" onClick={fetchMyRsvps}>
            Retry
          </button>
        </div>
      ) : rsvps.length === 0 ? (
        <div className="state-container">
          <div className="state-title">No registrations found</div>
          <p className="state-desc">You have not RSVP'd to any events yet.</p>
          <Link to="/" className="btn-primary">
            Explore Events
          </Link>
        </div>
      ) : (
        <div className="rsvps-list">
          {rsvps.map((rsvp) => {
            const isGoing = rsvp.status === 'going';
            const isProcessing = actionLoadingId === rsvp.event.id;

            return (
              <div key={rsvp.id} className="rsvp-card">
                <div className="rsvp-card-content">
                  <div className="rsvp-card-title-row">
                    <h2 className="rsvp-card-title">
                      <Link to={`/events/${rsvp.event.id}`}>{rsvp.event.title}</Link>
                    </h2>
                    {isGoing ? (
                      <span className="badge-rsvp going">Going ✓</span>
                    ) : (
                      <span className="badge-rsvp cancelled">Cancelled</span>
                    )}
                  </div>

                  <div className="rsvp-card-meta">
                    <div className="rsvp-card-meta-item">
                      <span>📅</span>
                      <span>{formatDate(rsvp.event.date)}</span>
                    </div>
                    <div className="rsvp-card-meta-item">
                      <span>📍</span>
                      <span>{rsvp.event.location}</span>
                    </div>
                    <div className="rsvp-card-meta-item">
                      <span>👥</span>
                      <span>{rsvp.event.goingCount} attending</span>
                    </div>
                  </div>
                </div>

                <div className="rsvp-card-actions">
                  <Link to={`/events/${rsvp.event.id}`} className="btn-secondary">
                    View
                  </Link>

                  {isGoing ? (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => handleToggleRsvp(rsvp.event.id, rsvp.status)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Updating...' : 'Cancel RSVP'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleToggleRsvp(rsvp.event.id, rsvp.status)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Updating...' : 'Re-RSVP'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
