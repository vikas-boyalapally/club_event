# Gather frontend

Standalone React + Vite web application for the Club Event Management System.

## Run

1. Start the MongoDB-backed API by following [`../backend/README.md`](../backend/README.md).
2. Copy `.env.example` to `.env`. The frontend defaults to `/api`; Vite proxies these requests to `http://localhost:3000`. If the backend runs elsewhere, set `VITE_BACKEND_URL` to its origin. For a deployed frontend, set `VITE_API_URL` to the deployed API base URL and configure the backend's `CORS_ORIGIN`.
3. Run `npm install`, then `npm run dev`.
4. Open the Vite development URL, usually `http://localhost:5173`. The sign-in screen reports whether `/api/health` is reachable.

Build a static production bundle with `npm run build`; preview it with `npm run preview`.

## Features

- Role-aware sign-in and student/staff registration.
- Students can discover and apply to events, request OD, check decisions, and submit event reports.
- Staff can search students and approve or reject pending OD requests.
- Admins can create, edit, and delete events, and view system records.

Admin registration is intentionally unavailable in the browser. Create the initial admin using `npm run admin:create` from the backend project.
