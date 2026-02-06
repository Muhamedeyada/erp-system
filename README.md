# ERP Monorepo

A full-stack Enterprise Resource Planning (ERP) system built with a monorepo architecture.

## Structure

```
erp/
├── backend/     # NestJS API (TypeScript, Prisma, PostgreSQL)
├── frontend/    # React SPA (Vite, TypeScript, Tailwind CSS)
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your VITE_API_URL (e.g. http://localhost:3000)
npm run dev
```

## Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run migrate` - Run Prisma migrations
- `npm run seed` - Seed the database

### Frontend
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Stack

**Backend:** NestJS, TypeScript, Prisma, PostgreSQL, JWT, Passport, bcrypt, class-validator, class-transformer

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Recharts, Lucide React

## License

MIT
