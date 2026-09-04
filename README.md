# Base Auth

A standalone, ready-to-run authentication starter extracted from a larger real-estate
platform. It ships a complete backend auth system (NestJS) and a matching frontend
(React) — JWT access/refresh tokens, roles & permissions (RBAC), password reset,
email verification, and a basic user profile.

## What's included

**Backend** (`backend/`, NestJS + TypeORM + PostgreSQL + Redis):
- `auth` — register, login, refresh, logout / logout-all, forgot/reset password,
  email verification (+ resend), change password, `/auth/me` (roles + permissions, cached).
- `users`, `roles`, `permissions` — CRUD + the many-to-many role↔permission and
  user↔role relations, seeded with a generic `ADMIN` / `USER` role pair.
- `profiles` — one profile per user (name, phone, avatar URL, document, birth date, gender).
- `mail` — SMTP password-reset email (falls back to logging the link to the console
  when SMTP isn't configured, so you can test the flow with zero setup).
- `schedulers` — a daily job that hard-deletes accounts 30 days after a user requests
  permanent deletion.
- Shared infra: `common/` (soft-delete base entity + repository, `Notification`/
  `NotificationException` error pattern, global exception filters, audit interceptor,
  RBAC guard + `@Public`/`@Roles`/`@Permissions` decorators), `database/` (TypeORM
  migrations + seed).

**Frontend** (`frontend/`, React 19 + Vite + Tailwind v4):
- Login, register, forgot-password, reset-password pages/forms (Zod validation,
  react-hook-form), all behind a themed auth layout with light/dark mode.
- `AuthContext` (token storage, silent refresh, permission helpers) and
  `NotificationContext` (global toast, wired to the API client's error events).
- A protected `/home` page (proves the end-to-end flow works) and `/profile`
  page (edit name/phone).
- The `HH*` core UI primitives actually used by the above (button, input, checkbox,
  form wrapper, alert, theme toggle, route guard, permission guard, error boundary).

## Running it

Requires PostgreSQL and Redis. Quickest way, from the repo root:

```bash
docker compose -f docker-compose.infra.yml up -d
```

Then:

```bash
cd backend
cp .env.example .env   # fill in JWT_SECRET at minimum
npm install
npm run migration:run  # creates tables + seeds ADMIN/USER roles and permissions
npm run start:dev      # http://localhost:5000, Swagger at /api
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Register a user from the UI, or `POST /api/auth/register`. New users get the `USER`
role automatically; promote one to `ADMIN` by inserting a row into `user_roles`
manually (there's no admin UI for this in the starter).

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. Notably:
- `JWT_SECRET` / `JWT_EXPIRATION` / `REFRESH_TOKEN_EXPIRATION_HOURS`
- `DB_HOST` / `DB_PORT` / `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME`
- `REDIS_HOST` / `REDIS_PORT` (used for the login rate-limiter and revoked-session cache)
- `SMTP_*` + `ENABLE_REAL_EMAIL` (leave `ENABLE_REAL_EMAIL=false` to log reset links
  to the console instead of sending real email)
- `VITE_API_URL` (frontend → backend base URL)

## What was deliberately simplified while extracting

This was trimmed from a much larger app, so a few things were cut or simplified
rather than dragged along:

- **Avatars**: the source app stored avatars as an uploaded file linked through a
  separate file-storage module. That module (S3/R2 upload, image processing, etc.)
  isn't part of "auth" and was dropped — `profiles.avatar` is now a plain nullable
  string column (put a URL in it, or wire up your own upload flow).
- **Addresses**: the source profile could have multiple linked addresses via a
  separate addresses module/table. Dropped for the same reason — not part of auth.
- **Roles/permissions seed**: the source seeded ~15 real-estate-specific roles and
  60+ permissions. The seed here only creates `ADMIN` / `USER` and permissions for
  the resources this starter actually has (`user`, `role`, `permission`, `profile`).
  Add your own as your app grows.
- **Schedulers**: only the "hard-delete accounts 30 days after a deletion request"
  job was kept; unrelated cron jobs (file cleanup, cash-flow generation, etc.) were
  dropped.
- **`PermissionResponse` bug fix**: the source's response DTO exposed `name`/`module`
  fields that don't exist on the `Permission` entity (it actually has `resource`/
  `action`), so permission list/detail responses were silently empty for those
  fields. Fixed here to expose `resource`/`action`.
- **Tests**: the source module's unit/property-based test suites were not ported —
  add coverage for your own logic as you build on this.
- **TypeScript 6.0 compat**: `tsconfig.json` sets `strictPropertyInitialization: false`,
  `ignoreDeprecations: "6.0"`, and an explicit `rootDir` — TypeScript 6.0 tightened
  defaults in ways the original project's own tsconfig doesn't yet account for
  (confirmed: the source project's own fresh build hits the same 500+ errors).
- **Known lint debt carried over as-is**: a handful of `@typescript-eslint/no-unsafe-*`
  findings around the JWT payload's `any` typing (backend `auth.service.ts`,
  `jwt.strategy.ts`) and `any` in the frontend's generic `ApiClient`, plus
  `react-refresh/only-export-components` on the three context files (they
  intentionally export both a provider and a hook). These are pre-existing patterns
  from the source project, left as-is rather than restructured during extraction.

## Project layout

```
base-auth/
├── backend/     NestJS API (see backend/.env.example)
└── frontend/    React + Vite SPA (see frontend/.env.example)
```

---

🤖 Extracted with [Claude Code](https://claude.com/claude-code)
