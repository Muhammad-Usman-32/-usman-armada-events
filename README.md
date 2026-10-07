# Armada Events App

Armada Events is a focused full-stack web application for organizing, discovering, and RSVPing to corporate events, workshops, and hackathons. It integrates secure Google OAuth 2.0 authentication, dynamic attendee tracking, and a scheduled background reminder system.

---

## 1. What the App Does
- **Google OAuth Authentication**: Single-click sign-in using Google accounts, exchanging Google identity tokens for secure backend-issued JWTs.
- **Event Management**: Create, view, update, and delete events with date, time, location, and description. Only the creator of an event can edit or delete it.
- **Event Discovery & Filtering**: Browse events with quick filtering for **Upcoming**, **Past**, or **All** events, along with real-time attendee counts.
- **RSVP Tracking**: Users can mark their attendance as "Going" or cancel their RSVP. Users can also view and manage all their registrations on a dedicated "My RSVPs" page.
- **Automated Event Reminders**: A scheduled background cron task scans for events happening within a configurable time window and logs attendee notifications directly to the server output.

---

## 2. Tech Stack
- **Frontend**:
  - React 18 with Vite
  - React Router DOM v6
  - Axios (with JWT bearer request interceptors)
  - `@react-oauth/google`
  - Vanilla CSS with custom properties (`theme.css`) — no heavy UI component frameworks
- **Backend**:
  - NestJS (TypeScript)
  - Prisma ORM
  - Passport.js & `@nestjs/jwt` (JWT bearer strategy and guard)
  - `google-auth-library` (Google ID token cryptographic verification)
  - `@nestjs/schedule` (cron job scheduling)
  - `class-validator` & `class-transformer` (fail-fast request and environment validation)
- **Database**:
  - PostgreSQL

---

## 3. Why NestJS + PostgreSQL + Prisma?
NestJS provides a modular, enterprise-grade architecture with strict dependency injection, strong TypeScript typings, and built-in lifecycle management that prevents architectural clutter. PostgreSQL offers rock-solid ACID compliance, relational integrity, and robust indexing for event scheduling and attendee tracking. Prisma ORM bridges them with end-to-end type safety, automated migrations, and an intuitive client API that eliminates boilerplate SQL while preventing runtime type errors.

---

## 4. Prerequisites
Before running the application locally, ensure you have the following installed:
1. **Node.js**: v18.0.0 or higher (v20+ recommended)
2. **npm**: v9.0.0 or higher
3. **PostgreSQL**: A local PostgreSQL instance running on port 5432
4. **Google Cloud OAuth Client ID**: A Web client ID created in Google Cloud Console

### Setting Up Local PostgreSQL:
Create a dedicated database for the application:
```sql
CREATE DATABASE armada_events;
```

---

## 5. Google OAuth 2.0 Setup (Quick Guide)
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Armada Events**.
3. Go to **APIs & Services > OAuth consent screen**, select **External**, fill in the app name and your contact email, add scopes (`openid`, `email`, `profile`), and add your personal email under **Test Users**.
4. Go to **APIs & Services > Credentials**, click **Create Credentials > OAuth client ID**.
5. Select **Web application** and add `http://localhost:5173` to **Authorized JavaScript origins**.
6. Copy the generated **Client ID** (e.g., `xxxxxxxxxxxx.apps.googleusercontent.com`).
7. Paste this client ID into both `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

---

## 6. Environment Variables Explained

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Port the backend server listens on | `3000` |
| `CORS_ORIGIN` | Allowed client origin for CORS | `http://localhost:5173` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/armada_events?schema=public` |
| `JWT_SECRET` | Secret key used to sign JWT access tokens | `super_secret_jwt_key_armada_events_2026` |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID for verifying ID tokens | `your_google_client_id.apps.googleusercontent.com` |
| `REMINDER_CRON` | Cron schedule pattern for reminder scans | `0 * * * *` (hourly) |
| `DEFAULT_REMINDER_HOURS` | Default time window in hours for reminder checks | `24` |
| `SEED_USER_EMAIL` | Placeholder organizer user email for seeder | `organizer@armadaevents.com` |
| `SEED_USER_NAME` | Placeholder organizer user name for seeder | `Armada Event Organizer` |

### Frontend (`frontend/.env`)
| Variable | Description | Default / Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the NestJS backend API | `http://localhost:3000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web Client ID for Sign-In button | `your_google_client_id.apps.googleusercontent.com` |
| `VITE_APP_NAME` | Application display name | `Armada Events` |

---

## 7. Installation & Running Instructions

### Step 1: Clone & Configure
```bash
git clone https://github.com/Muhammad-Usman-32/-usman-armada-events.git
cd -usman-armada-events
```

### Step 2: Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your PostgreSQL credentials and GOOGLE_CLIENT_ID

# Run migrations to apply database schema
npx prisma migrate dev

# Run seeder to populate sample events and settings
npm run prisma:seed

# Start backend server
npm run start:dev
```
The backend API is running at `http://localhost:3000`.

### Step 3: Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your VITE_GOOGLE_CLIENT_ID

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. Database Migrations & Seeding Approach
- **Database Schema**: Managed declaratively in `backend/prisma/schema.prisma`. Models include `User`, `Event`, `Rsvp` (with unique compound index on `[eventId, userId]`), and `Setting` (key-value store).
- **Initial Migration**: Located in `backend/prisma/migrations/20261007000000_init/migration.sql`.
- **Seeding (`backend/prisma/seed.ts`)**:
  1. Upserts the `reminder_hours` setting row using `DEFAULT_REMINDER_HOURS` (default: 24 hours).
  2. Upserts a placeholder organizer user using `SEED_USER_EMAIL` and `SEED_USER_NAME`.
  3. Creates sample events:
     - **Upcoming Event 1**: Tomorrow ("Annual Tech Innovation Summit 2026")
     - **Upcoming Event 2**: Next week ("Open Source Hackathon & Demo Day")
     - **Past Event**: Two weeks ago ("Frontend Architecture & Design Systems Workshop")
  4. Automatically registers the seed organizer as attending (`going`) for initial data demonstration.

---

## 9. How Automated Reminders Work
1. **Cron Job Schedule**: The reminder service runs as an automated background job scheduled via `@nestjs/schedule` using the cron expression from `REMINDER_CRON` (e.g., `0 * * * *` for hourly runs).
2. **Configurable Window**: It reads the active `reminder_hours` setting (X) directly from the PostgreSQL database (falling back to `DEFAULT_REMINDER_HOURS` if unset).
3. **Event & Attendee Query**: It queries for all events with dates between `now` and `now + X hours`. For each matched event, it retrieves all users whose RSVP status is `going`.
4. **Console Output**: A clear notification line is logged to the server console for each attendee:
   ```
   [REMINDER] Event "Annual Tech Innovation Summit 2026" is happening at 2026-10-08T10:00:00.000Z in Grand Ballroom, Armada Convention Center. User organizer@armadaevents.com (Armada Event Organizer) is attending!
   ```
5. **Manual Triggering (for testing)**: Authenticated users can trigger an immediate reminder check at any time via `POST /reminders/trigger`.

---

## 10. API Endpoints Reference
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/auth/google` | No | Exchange Google ID token for JWT & upsert user profile |
| `GET` | `/auth/me` | Yes | Get currently logged-in user profile |
| `GET` | `/events?filter=upcoming\|past\|all` | Yes | List events with attendee counts and user RSVP status |
| `POST` | `/events` | Yes | Create a new event |
| `GET` | `/events/:id` | Yes | Get event details, attendee list, and owner status |
| `PATCH` | `/events/:id` | Yes | Update an event (organizer/owner only) |
| `DELETE` | `/events/:id` | Yes | Delete an event (organizer/owner only) |
| `POST` | `/events/:id/rsvp` | Yes | Set RSVP status to `going` |
| `DELETE` | `/events/:id/rsvp` | Yes | Set RSVP status to `cancelled` |
| `GET` | `/rsvps/me` | Yes | List all RSVPs for the authenticated user |
| `GET` | `/settings/reminder-hours` | Yes | Get configured reminder lookahead hours |
| `PATCH` | `/settings/reminder-hours` | Yes | Update reminder lookahead hours in DB |
| `POST` | `/reminders/trigger` | Yes | Manually trigger reminder scan and console logging |

---

## 11. Demo Notes
- Log in using your Google account via the web interface.
- Browse the pre-seeded events on the home page. Filter between **Upcoming**, **Past**, and **All**.
- Click into any event to view attendee avatars, location, and description.
- Test RSVP functionality: click **RSVP - I'm Going** and **Cancel RSVP** to see real-time status and counter updates.
- Create your own event: click **+ Create Event**, fill out the form, and test editing or deleting your event. Notice that edit/delete controls are only shown to the event creator.
- Navigate to **My RSVPs** in the navbar to see all your registrations in one place.

---

## 12. Approx Time Spent
- **Total Time Spent**: ~5.5 hours
  - Architecture, database schema design & Prisma setup: ~45 mins
  - Backend NestJS modules (Auth, Events, RSVPs, Reminders, Settings): ~2 hours
  - Frontend React + Vite setup, pure CSS theme system, and pages: ~2 hours
  - Automated tests, validation, error handling & documentation: ~45 mins
