import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { RsvpItem } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import './MyRsvpsPage.css';

export const MyRsvpsPage: React.FC = () => {
  const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMyRsvps = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<RsvpItem[]>('/rsvps/me');
      // Filter only going RSVPs as specified
      setRsvps(response.data.filter((r) => r.status === 'going'));
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

  const handleCancelRsvp = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    setActionLoadingId(eventId);
    try {
      await api.delete(`/events/${eventId}/rsvp`);
      await fetchMyRsvps();
    } catch (err: any) {
      console.error('Failed to cancel RSVP:', err);
      alert(err.response?.data?.message || 'Failed to cancel RSVP.');
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
        <p>Review and manage all events you are currently registered to attend.</p>
      </div>

      {isLoading ? (
        <Loader label="Loading your registrations..." />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={fetchMyRsvps} />
      ) : rsvps.length === 0 ? (
        <EmptyState
          title="No upcoming registrations"
          description="You are not currently registered as going to any events."
          actionText="Explore Events"
          actionLink="/"
        />
      ) : (
        <div className="rsvps-list">
          {rsvps.map((rsvp) => {
            const isProcessing = actionLoadingId === rsvp.event.id;

            return (
              <div
                key={rsvp.id}
                className="rsvp-card"
                onClick={() => navigate(`/events/${rsvp.event.id}`)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') navigate(`/events/${rsvp.event.id}`);
                }}
              >
                <div className="rsvp-card-content">
                  <div className="rsvp-card-title-row">
                    <h2 className="rsvp-card-title">
                      <Link
                        to={`/events/${rsvp.event.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {rsvp.event.title}
                      </Link>
                    </h2>
                    <span className="badge-rsvp going">Going ✓</span>
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
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    onClick={(e) => handleCancelRsvp(e, rsvp.event.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Cancelling...' : 'Cancel RSVP'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
