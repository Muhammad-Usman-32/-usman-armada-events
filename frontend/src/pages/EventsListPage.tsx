import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { EventItem } from '../types';
import './EventsListPage.css';

export const EventsListPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<EventItem[]>('/events', {
        params: { filter },
      });
      setEvents(response.data);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

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
    <div className="events-page">
      <div className="events-header">
        <div className="events-header-left">
          <h1>Events</h1>
          <p>Discover company gatherings, tech summits, and team sessions.</p>
        </div>
        <Link to="/events/new" className="btn-primary">
          + Create Event
        </Link>
      </div>

      <div className="filter-bar">
        <button
          type="button"
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
        <button
          type="button"
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {isLoading ? (
        <div className="state-container">
          <div className="state-title">Loading events...</div>
          <div className="state-desc">Fetching latest event updates from server.</div>
        </div>
      ) : errorMessage ? (
        <div className="state-container">
          <div className="state-title" style={{ color: 'var(--danger)' }}>
            Error loading events
          </div>
          <div className="state-desc">{errorMessage}</div>
          <button type="button" className="btn-secondary" onClick={fetchEvents}>
            Retry
          </button>
        </div>
      ) : events.length === 0 ? (
        <div className="state-container">
          <div className="state-title">No events found</div>
          <p className="state-desc">
            {filter === 'upcoming'
              ? 'There are no upcoming events scheduled at the moment.'
              : filter === 'past'
              ? 'There are no past events in the archive.'
              : 'No events have been created yet.'}
          </p>
          <Link to="/events/new" className="btn-primary">
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              <div>
                <div className="event-card-header">
                  <h2 className="event-card-title">
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                  </h2>
                  {event.myRsvpStatus === 'going' && (
                    <span className="badge-rsvp going">Going ✓</span>
                  )}
                  {event.myRsvpStatus === 'cancelled' && (
                    <span className="badge-rsvp cancelled">Cancelled</span>
                  )}
                </div>

                <div className="event-card-meta">
                  <div className="event-card-meta-item">
                    <span>📅</span>
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="event-card-meta-item">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                </div>

                {event.description && (
                  <p className="event-card-desc">{event.description}</p>
                )}
              </div>

              <div className="event-card-footer">
                <div className="event-creator">
                  {event.creator.avatar && (
                    <img
                      src={event.creator.avatar}
                      alt={event.creator.name}
                      className="event-creator-avatar"
                    />
                  )}
                  <span>By {event.creator.name}</span>
                </div>
                <div className="event-going-pill">
                  {event.goingCount} {event.goingCount === 1 ? 'going' : 'going'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
