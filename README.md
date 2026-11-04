# Club Event Management System

The backend API and frontend web application are separate projects:

- [`backend/`](./backend/README.md) — Express, Sequelize, and MySQL REST API.
- [`frontend/`](./frontend/README.md) — React and Vite application.

## Run locally

1. Follow `backend/README.md` to configure MySQL, initialize the database, and create an admin.
2. In one terminal, run `cd backend` then `npm install` and `npm run dev`.
3. In another terminal, run `cd frontend` then `npm install` and `npm run dev`.
4. Open the Vite URL (normally `http://localhost:5173`). Configure `frontend/.env` if the API is not at `http://localhost:3000/api`.
