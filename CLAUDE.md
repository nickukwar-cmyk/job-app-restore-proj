# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**multivohub-jobapp** (MultivoHub) — an AI-powered job-application platform. A user uploads a CV, discovers and scores jobs ("Job Radar"), auto-applies, and practices interviews/negotiation with an AI coach (GPT-4o-mini + Whisper STT/TTS). Production runs at `jobs.multivohub.com`.

It is a TypeScript monorepo using **npm workspaces** (`frontend`, `backend`) plus a `shared/` directory and root-level `lib/`.

## Common commands

All commands are folder-aware on purpose (see "Conventions"). Run from the repo root unless noted.

```bash
# First-time local setup (needs Docker Desktop running for MySQL)
cp .env.example .env
bash scripts/bootstrap-local.sh        # starts MySQL container, installs deps, prepares DB

# Dev (both apps via concurrently): frontend :5173, backend :3001
npm run dev
npm run dev:frontend          # cd frontend && vite
npm run dev:backend           # cd backend && tsx watch src/server.ts

# Build
npm run build                 # backend (tsc) then frontend (tsc && vite build)
npm run build:backend
npm run build:frontend

# Tests (Vitest)
npm run test:backend          # cd backend && vitest run
npm run test:frontend
cd backend && npx vitest run src/services/__tests__/openai.test.ts   # single file
cd backend && npx vitest run -t "scam risk"                          # single test by name
cd backend && npm run test:watch

# Lint (flat config at repo root, typescript-eslint)
npx eslint .

# Database (Drizzle Kit; reads DATABASE_URL)
npm run db:push               # push schema to DB (cd backend && drizzle-kit push)
npm run db:generate           # generate SQL migration
npm run db:validate           # validate required env vars via lib/envSchema.mjs

# Smoke test against local stack
npm run smoke:local
```

There is no single-command lint script in `package.json`; invoke `npx eslint .` directly. The backend `tsc` build **excludes** test files (`*.test.ts`, `*.spec.ts`, `__tests__/`).

## Architecture

### Backend (`backend/`) — Express + tRPC + Drizzle

- **Entry: `backend/src/server.ts`** → compiled to `dist/backend/src/server.js`. Express app on `PORT` (default 3001) with `helmet`, `cors` (origin = `FRONTEND_URL`, credentials), and two `express-rate-limit` tiers (general + tighter AI limiter).
- **tRPC v11 is the primary API.** Routers live in `backend/src/trpc/routers/*.router.ts` and are composed in `backend/src/trpc/routers/index.ts` into `appRouter`. Mounted at `/trpc`. Uses the **superjson** transformer.
- **Auth/context: `backend/src/trpc/trpc.ts`** + `backend/src/lib/clerk.ts`. `createContext` authenticates the Clerk bearer token and resolves/creates the app user. Use `publicProcedure` for open endpoints and **`protectedProcedure`** (throws `UNAUTHORIZED` without a valid Clerk user) for everything user-scoped. Billing/credit gating attaches a `spendReservation` to context.
- **REST routes** coexist with tRPC for streaming/binary payloads (`backend/src/api/routes/`, mounted under `/api/...`):
  - `/api/interview/transcribe` — Whisper STT (multipart `audio`)
  - `/api/interview/tts` — TTS (`{ text }` → audio blob)
  - `/api/interview/stream` — interview conversation SSE stream
  - `/webhooks/stripe` — raw-body Stripe webhook (registered before `express.json()`)
  - Job Radar exposes a separate OpenAPI Express router (`modules/job-radar/api/`).
- **Background worker: `backend/src/worker.ts`** (separate PM2 process). Polls `auto_apply_queue` every 30s and applies via email (SMTP) or Playwright browser automation (Indeed/Gumtree); also runs the daily follow-up scheduler and a 30-min IMAP inbox monitor.
- **Layering:** `services/` holds business logic (OpenAI, CV parsing, billing/credits, interview engines, job sources, email). Newer features use a DDD-ish module layout under `backend/src/modules/<feature>/{domain,application,infrastructure}` (e.g. `job-radar`, `skillup`, `session-practice`, `legal-hub-search`). AI orchestration/clients/prompts live under `backend/src/ai/` and `backend/src/prompts/`.

### Frontend (`frontend/`) — React 19 + Vite + tRPC client

- **Entry `src/main.tsx` → `src/App.tsx` → `src/router.tsx`.** Routing is React Router v7 (`createBrowserRouter`) with **lazy-loaded** page components wrapped by `AppShell` (`components/layout/`). The screen registry and legacy redirects are centralized in `src/config/appScreens.ts`.
- **Pages** live in `src/app/<feature>/`; cross-cutting feature logic in `src/features/`; reusable UI in `src/components/`.
- **Data layer: `src/lib/api.ts`** creates the typed tRPC React-Query client (`createTRPCReact<AppRouter>`), `httpBatchLink` to `${VITE_API_URL}/trpc`, superjson, and injects the Clerk token via `headers()`.
- **State:** Zustand stores in `src/stores/` (e.g. `themeStore.ts`). Auth via `@clerk/clerk-react`. Styling via Tailwind.

### Shared types — `shared/`

`shared/trpc.ts` re-exports `AppRouter` from the backend so the frontend client is fully type-safe end-to-end. Other `shared/*.ts` files mirror DTOs. The compiled `.js` siblings are committed for the backend's NodeNext resolution — when you change a `shared/*.ts`, keep its usage consistent.

### Database — MySQL + Drizzle ORM

- Schema: `backend/src/db/schema.ts` (large, single source) plus modular schemas in `backend/src/db/schemas/` (`job-radar.ts`, `skillup.ts`). DB client: `backend/src/db/index.ts`.
- Drizzle config: `backend/drizzle.config.ts` (dialect `mysql`, migrations out to `backend/src/db/migrations`).
- Raw SQL migrations also exist (`db/migrations/*.sql`, `backend/src/db/migrations/`) and helper scripts (`scripts/run-migrations-on-vps.sh`, `scripts/db-push-on-vps.sh`).
- Profile model tables: `profiles`, `experiences`, `educations`, `skills`. `experiences` columns: `id, profileId, employerName, jobTitle, startDate, endDate, description`. `educations` columns: `id, profileId, schoolName, degree, fieldOfStudy, startDate, endDate`.

### Mobile — Capacitor

`capacitor.config.ts` wraps the built frontend. `npm run mobile:sync` / `mobile:add:ios|android` / `mobile:open:*` from root.

## Environment variables

Copy `.env.example` → `.env`. The backend **validates required vars on boot** via `lib/envSchema.mjs` (skipped when `NODE_ENV=test`); run `npm run db:validate` to check. Key vars: `DATABASE_URL`, Clerk (`CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`), `OPENAI_API_KEY` (+ optional `OPENAI_MODEL`, default `gpt-4o-mini`), Stripe + `STRIPE_WEBHOOK_SECRET`, PayPal, `RESEND_API_KEY`, SMTP, job-board APIs (Reed/Adzuna/Jooble), `ENCRYPTION_KEY` (≥32 chars), `PORT`, `FRONTEND_URL`.

## Conventions

- **Module system:** Both packages are ESM (`"type": "module"`). The backend compiles with **NodeNext**, so relative imports in backend/shared `.ts` use explicit **`.js`** extensions (e.g. `import { appRouter } from './trpc/routers/index.js'`). The frontend uses `bundler` resolution + the `@/*` → `frontend/src/*` path alias.
- **Folder-aware commands (`.cursor/rules/folder-aware-commands.mdc`):** Never present a bare `npm run build` / `npm install` / `pm2 ...`. Always include the exact directory — `cd /abs/path && command` or an explicit **Run In:** line. On failure, report what failed, likely cause, the **Run In:** path, and the corrected full command.
- **Backup before disk work (`.cursor/rules/backup-before-disk-work.mdc`):** This rule targets the owner's local machine (mirrors to `~/Downloads/KOPIA/...` via `scripts/rolling-workspace-backup.sh`); it is not needed in ephemeral cloud sessions where git is the safety net. It does not replace `git commit`.
- The same two rules are mirrored for Kiro under `.kiro/steering/`.

## Branches & deployment

> Note: the repo's primary owner-facing notes are historically maintained in Polish in this file's prior revisions and across `docs/`. The canonical machine-readable deploy facts live in `.canonical-repo-key`.

- **Working branches:** Claude works on `claude/improvements` (or `claude/<topic>`); Copilot on `copilot/*`. **Never commit directly to `main`** or to another agent's branch. One PR = one topic. Cloud sessions may use a session-specific `claude/...` branch as instructed.
- **Sync at session start:** `git fetch origin`; if `main` advanced, rebase your branch (`git rebase origin/main`) rather than merging. On the shared `claude/improvements`, push with `git push --force-with-lease`.
- **Deploy lock:** `.canonical-repo-key` (committed, **not** a secret — no keys/passwords) pins `CANONICAL_REMOTE_BASE=/root/project`, host `147.93.86.209` / `jobs.multivohub.com`, and `ALLOWED_DEPLOY_BRANCH`. Policy: `docs/policies/canonical-repo-deploy-lock-policy-v1.0.md`. Verify with `bash scripts/verify-canonical-repo.sh`.
- **Auto deploy:** `.github/workflows/deploy.yml` builds on push, and a self-hosted runner labelled `production` rsyncs to `/root/project` and reloads PM2.
- **PM2 (`infra/ecosystem.config.cjs`, cwd `/root/project`):** three processes — `jobapp-server` (Express/tRPC :3001), `jobapp-worker` (auto-apply worker), `jobapp-webhook` (deploy webhook :9000, localhost). Nginx config: `infra/nginx/multivohub-jobapp.conf`; it serves the SPA from `/root/project/frontend/dist`.
- **Manual deploy** (when Actions are down) is fully scripted: `bash scripts/deploy-safe.sh` (ack → VPS backup → `deploy.sh`; a dirty tree blocks unless `DEPLOY_ALLOW_DIRTY=1`). Build artifacts go to `frontend/dist/` and `dist/backend/`.

## Quality Control gate

This project runs a mandatory QC review before integration (see `docs/policies/quality-control-developer-role-spec.md` and `docs/policies/execution-reporting-standard.md`). No task is "done" without an explicit **Approved For Integration** / **Not Approved** decision. The squad workboard and phase ordering live in `docs/squad/` (`README.md`, `Squad_Workboard.md`); the executive rollout plan is `docs/executive-plan/final-rollout-execution-plan-v1.0.md`. FE work must follow `docs/policies/unified-app-layout-and-theme-standard-v1.0.md`.

## Themes

Six themes defined in `frontend/src/index.css` + `frontend/src/stores/themeStore.ts`: `light` (default), `dark`, `visually-impaired` (high contrast), `overstimulated` (calm), `noir` (b/w), `elegant` (cream/gold).

## Notes for working here

- The repo root is littered with historical `*_REPORT.md` / `*_PLAN.md` / `*_SUMMARY.md` status docs and several `.bak`/`.backup`/`.bak2` router files — these are not part of the build. Don't treat them as current spec unless a task points to them; prefer `docs/` and the source.
- `pnpm-workspace.yaml` exists, but the project is driven by **npm** workspaces and `package-lock.json`. Use npm.
