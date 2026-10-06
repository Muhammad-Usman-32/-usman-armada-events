export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  goingCount: number;
  myRsvpStatus?: 'going' | 'cancelled' | null;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  }>;
}

export interface RsvpItem {
  id: string;
  status: 'going' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  event: EventItem;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
