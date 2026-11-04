# Club Event Management System

The backend API and frontend web application are separate projects:

- [`backend/`](./backend/README.md) — Express and Mongoose REST API backed by MongoDB.
- [`frontend/`](./frontend/README.md) — React and Vite application.

## Run locally

1. Follow `backend/README.md` to configure MongoDB, initialize collections, and create an admin.
2. In one terminal, run `cd backend` then `npm install` and `npm run dev`.
3. In another terminal, run `cd frontend` then `npm install` and `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`). During development, Vite proxies `/api` to `http://localhost:3000`. To use another backend origin, set `VITE_BACKEND_URL` in `frontend/.env`; for a deployed frontend, set `VITE_API_URL` and configure the backend's `CORS_ORIGIN`.
