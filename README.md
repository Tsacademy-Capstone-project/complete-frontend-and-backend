# Complaint Management Project

This repository contains both parts of the application:

- `complaint-management-api/`: Node.js, Express, and MongoDB backend.
- `complaint-management-portal/`: React and Vite frontend.

## Run locally

Install and start each application in a separate terminal.

```bash
cd complaint-management-api
npm install
cp .env.example .env
# Configure your MongoDB URI, JWT secret, and optional admin signup code.
npm run dev
```

```bash
cd complaint-management-portal
npm install
npm run dev
```

The frontend defaults to `http://localhost:8000/api`. If your backend uses
another port, set `VITE_API_URL` in `complaint-management-portal/.env`.

Private `.env` files, dependencies, and generated build output are excluded
from Git. See each application's README for its features and configuration.

## Verify

Run `npm test` in both application folders. In the frontend folder, also run
`npm run lint` and `npm run build`.
