# InvoAI

A full-stack invoice generator with AI-powered assistance. Describe your work in plain language and let AI draft professional invoices, or build invoices manually and export them as PDFs.

## Tech Stack

**Frontend** (`frontend/`)

- React 19 + Vite 7
- Tailwind CSS 4
- React Router 7
- Axios (API client with JWT interceptor)

**Backend** (`backend/`)

- Node.js + Express
- PostgreSQL (Neon) + Prisma ORM
- JWT authentication (bcrypt for password hashing)
- Vercel AI SDK + Google Gemini (AI features)
- PDFKit (PDF export)

**Tooling**

- pnpm (workspace monorepo)
- Prettier + Husky + lint-staged (auto-format on commit)

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/installation)
- A Neon PostgreSQL database (or any PostgreSQL)
- A Google Gemini API key (for AI features)

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure the backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
PORT=5000
JWT_SECRET="your-secret-key"
GEMINI_API_KEY="your-gemini-key"
```

### 3. Run database migrations

```bash
pnpm --filter invo-ai-backend exec prisma migrate deploy
pnpm --filter invo-ai-backend exec prisma generate
```

### 4. Start the app

```bash
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Features

- **Authentication** — Sign up / log in with JWT
- **Invoices** — Create, view, update status, delete
- **AI assistance**
  - _Draft from text_: describe your work and get a full invoice draft
  - _Enhance items_: turn rough line-item notes into professional descriptions
- **PDF export** — Download any invoice as a formatted PDF
- **Dashboard** — Overview of outstanding, paid, and pending amounts

## API Overview

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/auth/signup`      | Register                      |
| POST   | `/api/auth/login`       | Login (returns JWT)           |
| GET    | `/api/auth/me`          | Current user                  |
| PUT    | `/api/auth/profile`     | Update profile                |
| GET    | `/api/invoices`         | List invoices                 |
| POST   | `/api/invoices`         | Create invoice                |
| GET    | `/api/invoices/:id`     | Get invoice                   |
| PUT    | `/api/invoices/:id`     | Update invoice (status, etc.) |
| DELETE | `/api/invoices/:id`     | Delete invoice                |
| GET    | `/api/invoices/pdf/:id` | Download PDF                  |
| POST   | `/api/ai/generate`      | Enhance item descriptions     |
| POST   | `/api/ai/draft`         | Generate full invoice draft   |

All routes below `/api/invoices` and `/api/ai` require a `Bearer` token.

## Scripts

```bash
pnpm dev              # Run frontend + backend in parallel
pnpm build            # Build the frontend
pnpm format           # Format the whole repo
pnpm format:check     # Verify formatting
```

## Project Structure

```
├── backend/
│   ├── prisma/               # Prisma schema & migrations
│   └── src/
│       ├── controllers/      # Route handlers (auth, invoice, ai, pdf)
│       ├── routes/           # Express routers
│       ├── middlewares/      # Auth middleware
│       ├── services/         # Business logic (invoices)
│       └── utils/            # Prisma client, JWT helpers
├── frontend/
│   └── src/
│       ├── components/       # Layout, ProtectedRoute
│       ├── context/          # AuthContext
│       ├── pages/            # Landing, Auth, Dashboard, Invoices, Profile
│       └── utils/            # Axios, API paths, helpers
├── .husky/                   # Pre-commit hook (lint-staged)
└── pnpm-workspace.yaml
```
