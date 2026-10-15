# Hotel Inventory Management System — Server

Backend for a hotel inventory/operations system covering reception, bar, restaurant,
kitchen, store/inventory, shifts, and GM/Owner reporting.

> This README reflects implementation state as of this point in development. Status
> markers (`✅ Done`, `🟡 In progress`, `⬜ Not started`) are based on what's actually
> been built and confirmed — verify against the real files before relying on anything
> marked 🟡 or ⬜ with existing scaffolding.

## Stack

- **Runtime**: Node.js, TypeScript (ESM, `"type": "module"`)
- **Framework**: Express 5
- **ORM**: Prisma 7 (`@prisma/adapter-pg` driver adapter over `pg`)
- **Database**: PostgreSQL (single shared DB, modular monolith — not microservices)
- **Jobs/queues**: BullMQ + Redis (separate `worker.ts` process from the API `index.ts`)
- **Validation**: Zod v4
- **Auth**: JWT access token + refresh token (httpOnly cookie)
- **Email**: Resend (via a BullMQ email queue/worker)
- **Docs**: `@asteasolutions/zod-to-openapi` registry → generated OpenAPI spec, served via `swagger-ui-express`
- **Testing/dev tooling**: Bruno (API client), nodemon, pino + pino-pretty (logging)
- **Package manager**: pnpm

## Architecture

- **Modular monolith**: one Express process, module boundaries enforced via service
  functions, not network calls.
- Each module follows the same file layout, prefixed with the module name (not bare
  `routes.ts` / `service.ts`):
  ```
  modules/<name>/
    <name>.routes.ts
    <name>.controller.ts
    <name>.service.ts
    <name>.repository.ts
    <name>.schema.ts
  ```
- `core/auth` and `core/users` are nested under `modules/core/` since they're tightly
  coupled (auth reads user records via `users.repository`).
- Repositories/services are plain object-literals of async methods — no classes.
  Prisma client is exported as `database`, not `prisma`.
- Cross-module decoupling goes through an in-process event bus
  (`shared/events/bus.ts`) rather than direct service-to-service calls where possible.
- Imports are relative (no path aliases) except for `#shared/*` / `#modules/*`
  subpath imports used to avoid deep `../../../` chains.

## Implemented modules

### ✅ Auth (`modules/core/auth`)

| Endpoint | Description |
|---|---|
| `POST /auth/login` | Email/password login, issues access token + refresh cookie |
| `POST /auth/refresh` | Rotates refresh token, issues new access token |
| `POST /auth/logout` | Revokes refresh token, clears cookie |
| `POST /auth/forgot-password` | Issues a password reset token, emails it (silently no-ops on unknown email) |
| `POST /auth/reset-password` | Consumes reset token, updates password |

- Refresh tokens are real JWTs with their own `jti`, tracked in `refresh_tokens`
  (separate secret from access tokens).
- **Open gap**: there's no `register`/signup endpoint yet — nothing creates the very
  first `OWNER` for a new organization. Currently the only way a `User` row is created
  is via the invite-accept flow, which requires an existing inviter. This needs either
  a dedicated bootstrap/signup endpoint (with its own guard against self-assigning
  `OWNER`) or a seed script.

### ✅ Users (`modules/core/users`)

| Endpoint | Description |
|---|---|
| `GET /users` | List users (GM/Owner only), filterable by role/department |
| `GET /users/:id` | Get user by id (GM/Owner only) |
| `PATCH /users/:id/deactivate` | Soft-deactivate a user (GM/Owner only) |
| `PATCH /users/:id/reactivate` | Reactivate a user (GM/Owner only) |
| `POST /users/invites` | Create a staff invite (GM/Owner only) |
| `GET /users/invites/:token/verify` | Verify an invite token (public) |
| `POST /users/invites/accept` | Accept invite, set password, create `User` row (public) |

- Invite flow: no `User` row exists until accepted. `staff_invites` holds the pending
  details (name, email, phone, role, department); accepting an invite creates the
  user and links it back to the invite.
- **Role-based invite restriction** (just added): `OWNER` can only invite
  `GENERAL_MANAGER`; `GENERAL_MANAGER` can invite anyone except `OWNER`
  (including other GMs, as currently written — confirm if that's intended).
  Enforced in `usersService.createInvite`, not at the route guard level.
- Soft-delete pair: `isActive` + `deactivatedAt`.

## In-progress modules

### 🟡 Rooms (`modules/rooms`)

- `rooms.repository.ts` / `rooms.service.ts`: Room + RoomCategory CRUD, room status
  derived from the latest non-`CHECKED_OUT` booking (no stored `state` column),
  `isActive` deactivate/reactivate, category price updates.
- `rooms.schema.ts`, `rooms.controller.ts`, `rooms.routes.ts` drafted.
- **Unconfirmed**: exact `Room.number` field type (assumed string, not verified against
  schema), relation-field naming for `category: { connect }`.

### 🟡 Bookings (`modules/bookings`)

- `bookings.repository.ts` / `bookings.service.ts`: create, check-in, checkout.
- Checkout wraps the booking status update + bulk-settling all `UNPAID` sales tied to
  the booking (via `chargeToRoomBookingId`) to `PAID`, in one `$transaction`.
- `markCheckoutDue` / `markOverdue` feed the auto-checkout sweep job
  (`shared/jobs/auto-checkout`).
- **TODO**: audit-log calls are stubbed pending a confirmed event-bus API; one-active-
  booking-per-room guard not yet verified against the real DB constraint
  (partial unique index added via manual migration, outside Prisma schema syntax).

### 🟡 Reports (`modules/reports`)

- `reports.repository.ts` / `reports.service.ts`: `findSnapshot`, `upsertSnapshot`,
  `getReport` (snapshot-or-live-fallback), `generateSnapshot`, `generateAllSnapshots`,
  `backfillMissingSnapshots` (startup catch-up for the daily report job).
- **`computeLiveReport` is a stub/placeholder only** — real per-department aggregation
  across shifts/sales/stock movements isn't built yet. No controller/routes confirmed
  built against it.

### ⬜ Stock, Orders, Shifts

Module folders and the standard route/controller/service/repository/schema files
exist on disk, but no implementation has been discussed or confirmed in this project
yet. Treat these as scaffolding only until filled in — don't assume any endpoint in
them works.

### 🟡 Audit (`modules/audit`)

- `audit.repository.ts` + `audit.service.ts` only — no controller/routes/schema, since
  audit logging is internal-only (written to by other modules via the event bus, not
  exposed as its own API).
- Uses a polymorphic `entityType`/`entityId` reference (only module doing so).
- Logs an explicit allow-list of "critical" events only (invite created/accepted,
  staff deactivated, password reset, price changes, void approvals, manual stock
  corrections, shift closed, etc.) — routine events (sale completion, order status
  progression, automatic checkout transitions) are intentionally excluded.
- Immutability (no UPDATE/DELETE) is enforced at the application level, not via a DB
  trigger, for now.

## Background jobs (`shared/jobs`, `src/worker.ts`)

| Job | Purpose |
|---|---|
| `auto-checkout` | Sweeps bookings into `CHECKOUT_DUE`/`OVERDUE` on a schedule |
| `daily-report` | Nightly snapshot generation + startup catch-up backfill |
| `email` | Sends invite and password-reset emails via Resend |

- Run as a separate `worker.ts` process from the API (`index.ts`).
- Repeatable job scheduling runs from the API boot sequence (`index.ts`), not from
  `worker.ts` — BullMQ's `upsertJobScheduler` is idempotent, safe to call every boot.
- `shared/jobs/test-job.ts` is a deliberate connection-persistence heartbeat (not
  scaffolding to delete), scheduled the same way as the real repeatable jobs.

### Known issue — job delivery gaps (unresolved)

Confirmed via job-ID comparison across API/worker logs: some jobs sent to the `test`
queue never get processed. Leading theory: `index.ts` imports `test-job.ts`, which —
unlike the properly split `*.queue.ts`/`*.worker.ts` files for the real jobs —
constructs both `Queue` and `Worker` in one module. Importing it from `index.ts`
therefore spins up a second live `Worker` in the API process itself, competing with
the dedicated worker process for the same queue. Fix: split `test-job.ts` into
`test-job.queue.ts` + `test-job.worker.ts`, matching the established pattern. Not yet
applied/confirmed.

Also still open: add `.on('error', ...)` handlers to all `Queue`/`Worker` instances
(currently only `.on('completed')`/`.on('failed')` are attached) to surface
connection-level errors as structured logs instead of raw unhandled stack traces.

## Database

- Single shared Postgres database across all modules.
- Every scalar field has `@map(...)` for snake_case columns; Prisma Client stays
  camelCase. Relation fields don't need `@map` — only their underlying FK columns do.
- One hand-written migration adds a partial unique index enforcing one open shift per
  user — not expressible in native Prisma schema syntax (`WHERE`-conditioned unique
  constraint).

## Environment variables

`NODE_ENV`, `PORT`, `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN` (default `15m`),
`JWT_REFRESH_EXPIRES_IN` (default `7d`), `REDIS_URL`, `CLIENT_ORIGIN`,
`RESEND_API_KEY`, `BCRYPT_SALT_ROUNDS` (default `12`)

Loaded via `@dotenvx/dotenvx` + validated with `envalid` in `shared/config/env.ts`.
