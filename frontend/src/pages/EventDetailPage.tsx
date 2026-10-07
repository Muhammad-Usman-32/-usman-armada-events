import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EventItem } from '../types';
import './EventDetailPage.css';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRsvpLoading, setIsRsvpLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEvent = async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<EventItem>(`/events/${id}`);
      setEvent(response.data);
    } catch (err: any) {
      console.error('Failed to fetch event:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load event details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRsvp = async () => {
    if (!id || !event) return;
    setIsRsvpLoading(true);
    try {
      await api.post(`/events/${id}/rsvp`);
      await fetchEvent();
    } catch (err: any) {
      console.error('Failed to RSVP:', err);
      alert(err.response?.data?.message || 'Failed to RSVP. Please try again.');
    } finally {
      setIsRsvpLoading(false);
    }
  };

  const handleCancelRsvp = async () => {
    if (!id || !event) return;
    setIsRsvpLoading(true);
    try {
      await api.delete(`/events/${id}/rsvp`);
      await fetchEvent();
    } catch (err: any) {
      console.error('Failed to cancel RSVP:', err);
      alert(err.response?.data?.message || 'Failed to cancel RSVP.');
    } finally {
      setIsRsvpLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !event) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/events/${id}`);
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      alert(err.response?.data?.message || 'Failed to delete event.');
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="state-container">
        <div className="state-title">Loading event details...</div>
      </div>
    );
  }

  if (errorMessage || !event) {
    return (
      <div className="state-container">
        <div className="state-title" style={{ color: 'var(--danger)' }}>
          Event Not Found
        </div>
        <p className="state-desc">{errorMessage || 'The requested event does not exist.'}</p>
        <Link to="/" className="btn-secondary">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const isOwner = user && event.createdBy === user.id;
  const isGoing = event.myRsvpStatus === 'going';

  return (
    <div className="event-detail-container">
      <Link to="/" className="event-detail-back">
        &larr; Back to all events
      </Link>

      <div className="event-detail-card">
        <div className="event-detail-header">
          <div>
            <h1 className="event-detail-title">{event.title}</h1>
          </div>

          {isOwner && (
            <div className="event-detail-owner-actions">
              <Link to={`/events/${event.id}/edit`} className="btn-secondary">
                Edit
              </Link>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <div className="event-detail-meta-grid">
          <div className="event-detail-meta-item">
            <span className="event-detail-meta-icon">📅</span>
            <div className="event-detail-meta-text">
              <span className="event-detail-meta-label">Date & Time</span>
              <span className="event-detail-meta-val">{formatDate(event.date)}</span>
            </div>
          </div>

          <div className="event-detail-meta-item">
            <span className="event-detail-meta-icon">📍</span>
            <div className="event-detail-meta-text">
              <span className="event-detail-meta-label">Location</span>
              <span className="event-detail-meta-val">{event.location}</span>
            </div>
          </div>

          <div className="event-detail-meta-item">
            <span className="event-detail-meta-icon">👤</span>
            <div className="event-detail-meta-text">
              <span className="event-detail-meta-label">Organized By</span>
              <span className="event-detail-meta-val">{event.creator.name}</span>
            </div>
          </div>

          <div className="event-detail-meta-item">
            <span className="event-detail-meta-icon">👥</span>
            <div className="event-detail-meta-text">
              <span className="event-detail-meta-label">Attendance</span>
              <span className="event-detail-meta-val">
                {event.goingCount} {event.goingCount === 1 ? 'person going' : 'people going'}
              </span>
            </div>
          </div>
        </div>

        {event.description && (
          <div className="event-detail-description">
            <h2 className="event-detail-section-title">About this event</h2>
            <p className="event-detail-description-body">{event.description}</p>
          </div>
        )}

        <div className="event-detail-rsvp-box">
          <div className="event-detail-rsvp-status">
            <strong>Your RSVP Status:</strong>
            {isGoing ? (
              <span className="badge-rsvp going">Going ✓</span>
            ) : event.myRsvpStatus === 'cancelled' ? (
              <span className="badge-rsvp cancelled">Cancelled</span>
            ) : (
              <span style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)' }}>
                Not responded yet
              </span>
            )}
          </div>

          <div>
            {isGoing ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={handleCancelRsvp}
                disabled={isRsvpLoading}
              >
                {isRsvpLoading ? 'Updating...' : 'Cancel RSVP'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleRsvp}
                disabled={isRsvpLoading}
              >
                {isRsvpLoading ? 'Updating...' : "RSVP - I'm Going"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="event-attendees-card">
        <h2 className="event-detail-section-title">
          Attendees ({event.goingCount})
        </h2>
        {event.attendees && event.attendees.length > 0 ? (
          <div className="attendees-list">
            {event.attendees.map((attendee) => (
              <div key={attendee.id} className="attendee-chip">
                {attendee.avatar ? (
                  <img
                    src={attendee.avatar}
                    alt={attendee.name}
                    className="attendee-chip-avatar"
                  />
                ) : (
                  <div
                    className="attendee-chip-avatar"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {attendee.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{attendee.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
            No one has RSVP'd as going yet. Be the first!
          </p>
        )}
      </div>
    </div>
  );
};
