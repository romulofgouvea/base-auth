# Base Auth

**🇧🇷 Também disponível em [Português](README.pt-BR.md).**

A production-grade authentication and access-control foundation for your next
product — extracted and hardened from a real-world real-estate platform, so you
don't have to build login, sessions, and permissions from a blank page every
time you start something new.

## Why Base Auth

Authentication looks simple until it isn't: token refresh races, password-reset
edge cases, permission checks that need to be fast *and* correct, email flows
that must degrade gracefully in dev. Base Auth packages the solved version of
all of that into a backend + frontend pair that already talk to each other, so
your team can spend its time on the product instead of re-solving identity.

It's designed to be a **starting point you fork**, not a black-box dependency —
every piece is plain NestJS and React code you're expected to read, change, and
extend.

## What you get

- **Secure sessions** — JWT access/refresh tokens with silent refresh, logout
  and logout-everywhere, and Redis-backed revocation.
- **Roles & permissions (RBAC)** — a ready `ADMIN` / `USER` split, plus the
  data model and guards to define your own roles and fine-grained permissions.
- **Full account lifecycle** — registration, email verification, forgot/reset
  password, change password, and account deletion with a grace period.
- **User profiles** — a working profile page and API out of the box.
- **A frontend that matches** — login, register, and password screens with
  validation, light/dark theming, and the auth wiring already connected to the
  API.
- **Runs anywhere in minutes** — one Docker Compose command brings up the
  backend, frontend, database, and cache together, with working defaults
  already configured.

## Getting started

```bash
npm run up      # starts Postgres, Redis, backend, and frontend
```

Backend runs at http://localhost:5000 (API docs at `/api`), frontend at
http://localhost:5173. Register an account from the UI and you're in.

For the full setup guide, environment variables, architecture details, and
what to expect when extending the project, see **[DEVELOPER.md](DEVELOPER.md)**.

---

🤖 Extracted with [Claude Code](https://claude.com/claude-code)
