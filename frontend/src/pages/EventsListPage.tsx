import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { EventItem } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import './EventsListPage.css';

export const EventsListPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [onlyMine, setOnlyMine] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.get<EventItem[]>('/events', {
        params: {
          filter,
          mine: onlyMine ? 'true' : undefined,
        },
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
  }, [filter, onlyMine]);

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

      <div className="filter-container">
        <div className="filter-bar">
          <button
            type="button"
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
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
        </div>

        <label className="filter-mine-label">
          <input
            type="checkbox"
            className="filter-mine-checkbox"
            checked={onlyMine}
            onChange={(e) => setOnlyMine(e.target.checked)}
          />
          <span>My Events Only</span>
        </label>
      </div>

      {isLoading ? (
        <Loader label="Loading events..." />
      ) : errorMessage ? (
        <ErrorMessage message={errorMessage} onRetry={fetchEvents} />
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description={
            onlyMine
              ? "You haven't created any events yet."
              : filter === 'upcoming'
              ? 'There are no upcoming events scheduled at the moment.'
              : filter === 'past'
              ? 'There are no past events in the archive.'
              : 'No events have been created yet.'
          }
          actionText="Create First Event"
          actionLink="/events/new"
        />
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div
              key={event.id}
              className="event-card"
              onClick={() => navigate(`/events/${event.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/events/${event.id}`);
              }}
            >
              <div>
                <div className="event-card-header">
                  <h2 className="event-card-title">
                    <Link
                      to={`/events/${event.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.title}
                    </Link>
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
                  {event.creator?.avatar ? (
                    <img
                      src={event.creator.avatar}
                      alt={event.creator.name}
                      className="event-creator-avatar"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span>By {event.creator?.name || 'Organizer'}</span>
                </div>
                <div className="event-going-pill">
                  {event.goingCount} going
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
