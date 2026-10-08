import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { EventItem } from '../types';
import { Loader } from '../components/common/Loader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import './EventFormPage.css';

export const EventFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isNotOwner, setIsNotOwner] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isEditMode || !id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const response = await api.get<EventItem>(`/events/${id}`);
        const event = response.data;

        // Check if user is owner
        if (user?.id && String(event.createdBy) !== String(user.id)) {
          setIsNotOwner(true);
          setApiError('You are not authorized to edit this event. Only the organizer can modify it.');
          return;
        }

        setTitle(event.title);
        setDescription(event.description || '');
        setLocation(event.location);

        // Format ISO date to YYYY-MM-DDTHH:mm for datetime-local input
        try {
          const d = new Date(event.date);
          const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setDate(localIso);
        } catch {
          setDate('');
        }
      } catch (err: any) {
        console.error('Failed to load event for editing:', err);
        setApiError(err.response?.data?.message || 'Failed to fetch event data.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading) {
      fetchEvent();
    }
  }, [id, isEditMode, user, isAuthLoading]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!date) {
      newErrors.date = 'Date and time are required';
    }
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        location: location.trim(),
      };

      if (isEditMode && id) {
        await api.patch(`/events/${id}`, payload);
        navigate(`/events/${id}`);
      } else {
        const response = await api.post<EventItem>('/events', payload);
        navigate(`/events/${response.data.id}`);
      }
    } catch (err: any) {
      console.error('Failed to save event:', err);
      setApiError(err.response?.data?.message || 'Failed to save event. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return <Loader label="Loading event..." />;
  }

  if (isNotOwner) {
    return (
      <div className="form-container">
        <ErrorMessage message={apiError || 'You are not authorized to edit this event.'} />
        <Link to={`/events/${id}`} className="btn-secondary">
          &larr; Back to Event Detail
        </Link>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
        <p>
          {isEditMode
            ? 'Update the event details below.'
            : 'Fill in the information to publish a new event.'}
        </p>
      </div>

      {apiError && <ErrorMessage message={apiError} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Event Title *
          </label>
          <input
            id="title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q4 Strategy All-Hands"
          />
          {errors.title && <div className="form-error-inline">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">
            Date & Time *
          </label>
          <input
            id="date"
            type="datetime-local"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <div className="form-error-inline">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="location">
            Location *
          </label>
          <input
            id="location"
            type="text"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Conference Room A or Zoom link"
          />
          {errors.location && <div className="form-error-inline">{errors.location}</div>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description (Optional)
          </label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, agenda, or prerequisites for attendees..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
};
