# Complaint Management Portal

Start the API from `../complaint-management-api` with `npm run dev`, then start
the portal with `npm run dev`. The API URL defaults to `http://localhost:8000/api`;
set `VITE_API_URL` in this folder's `.env` to override it.

Sessions are stored in `sessionStorage` so each browser tab can sign in as a
different account. The previous shared local-storage token is discarded; after
updating, refresh each tab and sign in again. Signing out affects only that tab.
User complaint pages require `USER`; administrators are redirected to `/admin`.

The admin dashboard lists all users' complaints, supports search and status
filters, and resolves active complaints with a written response. Users can read
that response in complaint details and close a resolved complaint. User complaint
lists refresh when their tab receives focus.

Run `npm test`, `npm run lint`, and `npm run build` for verification.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
