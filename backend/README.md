# Club Event Management API

Backend API for the Club Event Management System, built with Express, Mongoose, and MongoDB. It uses the `club_event` database and five collections: `students`, `staff`, `admins`, `apply_ods`, and `events`.

## Setup

1. Start MongoDB locally, or set `MONGODB_URI` in `.env` to your MongoDB connection string. `MONGODB_DB` selects the database (defaults to `club_event`).
2. Copy `.env.example` to `.env` and set a long random `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm run db:sync` to create the tables.
5. Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`, then run `npm run admin:create`.
6. Run `npm start`. The API listens on port `3000` by default.

The default connection is `mongodb://localhost:27017/` with the database name `club_event`. Mongoose creates collections and indexes when the API starts; `npm run db:sync` can initialize them separately. MongoDB data is not automatically migrated from the previous MySQL setup.

## Authentication

Register students and staff using `POST /api/auth/register/student` or `POST /api/auth/register/staff`. Admins are provisioned with the setup command rather than public registration. Log in using `POST /api/auth/login` with `{ "role": "student|staff|admin", "email": "...", "password": "..." }`. Use the returned token as `Authorization: Bearer <token>`.

Passwords are hashed with bcrypt. API responses omit password hashes. Students and staff can update their profile but cannot change their email through the profile endpoint.

## Routes

All routes below are prefixed with `/api`.

| Role | Method | Path | Purpose |
|---|---|---|---|
| Public | GET | `/health` | Health check |
| Public | POST | `/auth/register/student` | Student registration (`fullName`, `email`, `password`, `department`, `year`; optional `phone`) |
| Public | POST | `/auth/register/staff` | Staff registration (`fullName`, `email`, `password`, `department`; optional `phone`) |
| Public | POST | `/auth/login` | Login for any role |
| Student | GET/PATCH | `/students/me` | View/update own profile |
| Student | GET | `/students/events?search=...&date=YYYY-MM-DD` | Search events |
| Student | POST | `/students/events/:eventId/apply` | Apply to an event |
| Student | GET | `/students/applications` | View event applications |
| Student | POST | `/students/applications/:applicationId/od` | Request OD with `{ "reason": "..." }` |
| Student | GET | `/students/od` | View OD request status |
| Student | POST | `/students/applications/:applicationId/report` | Submit/update report with `{ "reportText": "..." }` |
| Staff | GET | `/staff/students?search=...` | View/search students |
| Staff | GET | `/staff/od-applications?status=pending\|approved\|rejected` | View OD applications (pending by default) |
| Staff | PATCH | `/staff/od-applications/:applicationId` | Approve/reject pending OD with `{ "status": "approved|rejected" }` |
| Admin | GET | `/admin/records` | View all records |
| Admin | POST | `/admin/events` | Add event (`title`, `description`, `venue`, `eventDate`, `organizer`; optional times and capacity) |
| Admin | PATCH | `/admin/events/:eventId` | Update event fields |
| Admin | DELETE | `/admin/events/:eventId` | Delete event and its associated applications |

The `apply_ods` collection stores both a student's event application and its optional OD request/report, uniquely keyed by student and event. Event deletion also removes associated applications.

## Example workflow

1. Register and log in as a student.
2. Search `GET /api/students/events`, apply with `POST /api/students/events/:eventId/apply`.
3. Request OD with `POST /api/students/applications/:applicationId/od`, then check `GET /api/students/od`.
4. Staff reviews the request using `GET /api/staff/od-applications` and `PATCH /api/staff/od-applications/:applicationId`.
5. The student submits an event report with `POST /api/students/applications/:applicationId/report`.
