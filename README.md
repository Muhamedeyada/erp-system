# ERP System

Multi-tenant ERP with an accounting module. Each company gets its own data. Built as a monorepo: NestJS backend + React frontend.

## What it does

- **Multi-tenant** – Companies are isolated by tenant. All relevant tables use `tenantId`.
- **Auth** – Register a company, then log in. JWT-based.
- **Modules per tenant** – You enable modules (e.g. Accounting) per company. The demo has Accounting only.
- **Accounting** – Chart of accounts (tree), journal entries (double-entry), invoices, payments, trial balance report. Invoices and payments create journal entries automatically.
- **Roles** – Admin and User.
- **Dark mode** – Toggle in the UI.

## Tech

- **Backend:** NestJS, Prisma, PostgreSQL, JWT, bcrypt, class-validator
- **Frontend:** React, TypeScript, Vite, Tailwind, React Router, Recharts, Axios

## Run it

**Need:** Node 18+, PostgreSQL 14+, npm.

### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Set in `.env`: `DATABASE_URL`, `JWT_SECRET`. Optionally `PORT` (default 3001), `FRONTEND_URL` (e.g. http://localhost:5173) for CORS, and `DEFAULT_MODULES` (comma-separated module codes to enable for new companies, default `ACCOUNTING`).

```bash
npx prisma migrate dev
npm run seed
npm run dev
```

API: http://localhost:3001 (or your PORT). Base path is `/api`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` to your backend URL (e.g. http://localhost:3001).

```bash
npm run dev
```

App: http://localhost:5173. Register a company, log in, use the dashboard and accounting.

## Project layout

- `backend/` – NestJS app. `prisma/` has schema, migrations, seed. `src/` has auth, common (guards, pipes, filters, middleware), modules (module registry), **business-modules** (aggregate of feature modules: accounting, etc.). To add a new business module (e.g. HR): add it to `business-modules.module.ts` and register the module code in the DB (seed/migration); optionally set `DEFAULT_MODULES` so new tenants get it.
- `frontend/` – React app. `src/` has components, pages (dashboard, accounting pages, login, register), services (API client), types, contexts (auth, dark mode).

## Scripts

**Backend:** `npm run dev` (watch), `npm run build`, `npm run start`, `npm run seed`, `npx prisma migrate dev`, `npx prisma studio`

**Frontend:** `npm run dev`, `npm run build`, `npm run preview`

## API (prefix `/api`)

- `POST /auth/register-company` – Register company
- `POST /auth/login` – Login
- `GET /auth/me` – Current user (auth required)
- `GET/POST /accounting/accounts` – Chart of accounts
- `GET/POST /accounting/journal-entries` – Journal entries
- `GET/POST /accounting/invoices` – Invoices
- `GET/POST /accounting/payments` – Payments
- `GET /accounting/reports/trial-balance` – Trial balance

MIT
