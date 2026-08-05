# EduTrack Frontend

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui frontend for EduTrack. See the
[repo root README](../README.md) for the full project overview, Docker setup, and demo accounts.

## Local development

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your running backend
npm install
npm run dev
```

Open http://localhost:3000. Requires the backend API running separately (see `../backend/README` via
the root README's "Running Without Docker" section, or run the whole stack with `docker compose up`
from the repo root instead).

## Structure

- `app/` — routes: `(auth)/login`, `(dashboard)/{dashboard,users,classes,subjects,assignments,submissions,settings}`
- `components/ui/` — shadcn/ui primitives (Radix-based)
- `components/features/` — page-specific components (forms, dialogs, tables) grouped by resource
- `components/layout/` — app shell, sidebar nav
- `lib/api/` — Axios client with auth-refresh interceptor
- `lib/auth/` — auth context + token storage
- `lib/schemas/` — Zod schemas + TypeScript types mirroring the backend DTOs, one file per resource
- `hooks/queries/` — TanStack Query hooks, one file per resource
- `middleware.ts` — route protection + role gating (reads the access-token cookie)

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
