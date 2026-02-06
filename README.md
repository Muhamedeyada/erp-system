# Multi-Tenant ERP System with Accounting Module

## 📋 Overview

A full-stack Enterprise Resource Planning (ERP) system built with a monorepo architecture. The system supports multi-tenancy, allowing multiple organizations to use the same instance with isolated data. The **Accounting Module** implements double-entry bookkeeping with chart of accounts, journal entries, invoicing, payments, and financial reports.

### Features

- **Multi-Tenancy** – Row-level isolation with `tenantId` on all tenant-scoped data
- **Authentication** – JWT-based auth with company registration and login
- **Modular System** – Enable/disable modules (e.g. Accounting) per tenant
- **Accounting Module**
  - Chart of Accounts (hierarchical tree)
  - Journal Entries (multi-line, balanced debits/credits)
  - Invoicing (with auto journal entry: Dr AR, Cr Revenue)
  - Payments (with auto journal entry: Dr Cash/Bank, Cr AR)
  - Trial Balance Report with CSV export
- **Role-Based Access** – ADMIN and USER roles
- **Dark Mode** – Theme toggle in the frontend

---

## 🏗️ Architecture

### Multi-Tenancy

- **Row-level security** – Every tenant-scoped table includes `tenantId`
- **Tenant middleware** – Extracts tenant from JWT and attaches to request
- **Module guard** – Ensures the tenant has the required module (e.g. ACCOUNTING) enabled before accessing protected routes

### Modular System

- Modules (ACCOUNTING, etc.) are registered in the `Module` table
- `TenantModule` links tenants to enabled modules
- Protected routes use `@RequireModule('ACCOUNTING')` decorator

### Accounting Module

- **Double-entry bookkeeping** – Every transaction has balanced debits and credits
- **Chart of Accounts** – Standard structure: Assets (1xxx), Liabilities (2xxx), Equity (3xxx), Revenue (4xxx), Expenses (5xxx)
- **Journal Entries** – Manual entries and automatic entries from invoices and payments
- **Invoices** – Create invoice → auto journal entry (Dr Accounts Receivable, Cr Sales Revenue)
- **Payments** – Record payment → auto journal entry (Dr Cash/Bank, Cr Accounts Receivable)

---

## 🛠️ Tech Stack

### Backend

- **NestJS** – Node.js framework
- **Prisma ORM** – Database access and migrations
- **PostgreSQL** – Database
- **JWT** – Authentication (Passport + JWT strategy)
- **bcrypt** – Password hashing
- **class-validator / class-transformer** – DTO validation

### Frontend

- **React** – UI library
- **TypeScript** – Type safety
- **Vite** – Build tool and dev server
- **Tailwind CSS** – Styling
- **React Router** – Client-side routing
- **Recharts** – Charts (dashboard)
- **Lucide React** – Icons
- **Axios** – HTTP client

---

## 📦 Project Structure

```
D:\ERP/
├── backend/                    # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   ├── migrations/         # Migration history
│   │   └── seed.ts             # Database seed
│   ├── src/
│   │   ├── accounting/         # Accounting module
│   │   │   ├── accounts/       # Chart of accounts CRUD
│   │   │   ├── journal-entries/
│   │   │   ├── invoices/
│   │   │   ├── payments/
│   │   │   └── reports/        # Trial balance, etc.
│   │   ├── auth/               # Auth (register, login, JWT)
│   │   ├── common/             # Guards, pipes, filters, middleware
│   │   ├── modules/            # Tenant module management
│   │   └── prisma/             # Prisma service
│   └── .env.example
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   └── accounting/     # Accounting-specific forms & modals
│   │   ├── contexts/           # Auth, DarkMode
│   │   ├── pages/              # Route pages
│   │   │   ├── accounting/     # Chart of Accounts, Journal Entries, etc.
│   │   │   │   └── reports/    # Trial Balance
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript types
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** or **yarn**

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET` – Strong secret for production
- `PORT` – API port (default 3001)
- `FRONTEND_URL` – Frontend origin for CORS (e.g. http://localhost:5173)

```bash
npx prisma migrate dev
npm run seed    # Optional: seed default modules and sample data
npm run dev
```

API runs at `http://localhost:3001` (or your `PORT`).

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:

- `VITE_API_URL` – Backend base URL (e.g. `http://localhost:3001`)

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Register & Login

1. Open `http://localhost:5173`
2. Click **Register** and create a company (name, email, password)
3. Login and access the Dashboard and Accounting module

---

## 📜 Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npx prisma migrate dev` | Run migrations |
| `npm run seed` | Seed database |
| `npx prisma studio` | Open Prisma Studio (DB GUI) |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔗 API Routes (under `/api`)

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register-company` | Register new company (tenant) |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Current user (protected) |
| GET | `/accounting/accounts` | List chart of accounts |
| POST | `/accounting/accounts` | Create account |
| GET | `/accounting/journal-entries` | List journal entries |
| POST | `/accounting/journal-entries` | Create journal entry |
| GET | `/accounting/invoices` | List invoices |
| POST | `/accounting/invoices` | Create invoice |
| GET | `/accounting/payments` | List payments |
| POST | `/accounting/payments` | Create payment |
| GET | `/accounting/reports/trial-balance` | Trial balance report |

---

## 📄 License

MIT
