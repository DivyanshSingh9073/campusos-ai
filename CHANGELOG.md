# CampusOS AI — Changelog

## Phase 15 — Release Candidate v1.0 (Stability, Polish, Documentation)

**Focus:** production readiness — no large new features, per the phase brief.

### Backend
- **Security**: `config.ts` now refuses to boot when `NODE_ENV=production` if `JWT_SECRET` is still the dev default or `DATABASE_URL` is missing. Removed the committed `Backend/.env` (real secrets should never be in source control — this is the actual fix, not just a warning). Added a root `.gitignore` (there wasn't one before, which is how `.env` and `Backend/dist/` got committed in the first place).
- **Cleanup**: removed `Backend/user.js` (dead file, unused JSONPlaceholder mock data, flagged since the original audit), removed committed `Backend/dist/` (stale build output), removed the unused `requireEnv` helper in `config.ts` (dead code — confirmed via grep, never called).
- **Docs**: `Backend/.env.example` now includes the previously-missing `NODE_ENV` and documents the production `JWT_SECRET` requirement.
- Verified (no changes needed — already correct): JWT signing/verification, per-request authorization (every query filters by the authenticated `user_id`), `requireAuth` applied consistently across all protected routers.

### Frontend
- **Accessibility**: all three modals (`LogoutModal`, `EditProfileModal`, NoteEditorPage's delete confirmation) now close on Escape via a new shared `useEscapeKey` hook, and carry `role="dialog"`/`aria-modal="true"`/`aria-labelledby`. The shared `Toast` component now has `role="status"`/`aria-live="polite"` so screen readers announce it.
- **Bug fix**: Dashboard was capturing task-load errors into state but never rendering them — added a visible error banner. This was a real "missing error state" gap, not a stylistic choice.
- **Consistency**: fixed one stray button hover-color inconsistency (`ErrorBoundary`'s button used `#7A72FF` instead of the `#7C6FFF` every other primary button in the app uses).

### Documentation
- Rewrote `README.md`: accurate feature list (previous version claimed "Upload/Download Notes" and unqualified "AI Chat Support," neither of which exist as described), full install/env/DB-setup/run/production-deploy instructions, project structure overview. Verified every documented command against the actual `package.json` scripts before writing it down.
- Fixed `Docs/Database.md` — previously documented a `notes` table with `subject`/`file_url` columns that were never implemented, and didn't mention `notifications` or the Phase 14 `users.branch`/`users.year` columns at all. Now matches `schema.sql` exactly.
- Fixed `Docs/API.md` — previously listed `POST /api/notes/upload` (never existed; the real endpoint is `POST /api/notes`) and was missing `PUT /api/notes/:id` and the Phase 14 `PATCH /api/auth/profile`.
- Updated `Docs/Features.md` and `Docs/Roadmap.md` to reflect actual v1.0 state instead of a stale, generic feature list.
- Resolved the unresolved Git merge-conflict markers in `TODO.md` (present since at least the original audit) — rewritten as an honest post-v1.0 roadmap.
- Added `RELEASE_NOTES.md`.

### Explicitly not done (and why)
- No large new features, per the phase brief.
- No response-envelope standardization (e.g. wrapping everything in `{ success, data }`) — would break every existing frontend call site built across Phases 10–14; the existing `{ error: string }` error shape was already consistent and is enforced project-wide via `asyncHandler` since Phase 14.
- No deep bundle-size/render-profiling audit — no browser/build tooling available in this environment to measure it; targeted, verifiable wins (useMemo on search/filter, useCallback on polling) were kept from Phase 14, no regressions introduced.

---

## Phase 14 — Production Readiness & UX

**Focus:** Production readiness and UX polish, continuing directly from Phase 13.

---

### Backend

#### Added
- `middleware/asyncHandler.ts` *(already existed from Phase 13, now applied everywhere)* — every route in `auth`, `notes`, and `tasks` is now wrapped in it. Express 4 doesn't forward async rejections to the error handler on its own; before this, a DB error in those routes would have hung as an unhandled rejection instead of returning a proper 500.
- `middleware/requestLogger.ts` — one line per request (`METHOD path status Nms`), no new dependency.
- `middleware/notFound.ts` / `middleware/errorHandler.ts` — extracted from inline handlers in `index.ts` for organization; behavior unchanged.
- `middleware/rateLimit.ts` — simple in-memory fixed-window limiter (10 requests / 15 min per IP+route), applied to `/api/auth/login` and `/api/auth/register`. Addresses the "no brute-force protection" gap from the original audit. Documented limitation: in-memory only, won't share state across multiple backend instances.
- `PATCH /api/auth/profile` — updates `name`/`branch`/`year`. Validated the same way as every other route (manual checks, `{ error }` responses).
- `notifications` list endpoint now accepts `?type=` and `?unread=true` filters.
- `users.branch`, `users.year` columns (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — safe against existing data).
- `tasks_user_id_idx` index — every task query filters by `user_id`; notes already had this, tasks never did.

#### Changed
- `auth.routes.ts`: added email-format validation on register, name/title length caps, rate limiting on login/register. Response shapes for existing success/error cases are unchanged.
- `notes.routes.ts` / `tasks.routes.ts`: wrapped in `asyncHandler`; added title-length validation and `due_date` format validation that were previously missing.
- `index.ts`: now composed from the extracted middleware modules; added `helmet`'s `crossOriginResourcePolicy` option and a 1mb JSON body limit.

### Not changed
- JWT signing/verification, bcrypt hashing, token expiry — authentication mechanics are untouched.
- No new npm dependencies were introduced (checked against `package.json` before writing any import).

---

### Frontend

### Added
- `pages/components/Spinner.tsx` — reusable spinner + `FullPageSpinner`.
- `pages/components/ErrorBoundary.tsx` — catches render-time crashes anywhere in the tree, shows a recoverable fallback instead of a blank screen. Wrapped around `<App />` in `main.tsx`. Uses a full `window.location.assign` on recovery — a deliberate exception to the "no window.location" rule, since a crashed React tree needs a genuine remount, not a client-side route change.
- `pages/components/Toast.tsx` — extracted from `NoteEditorPage`'s local `Toast` (was about to become duplicated a second time in `TasksPage`); now shared by `NoteEditorPage`, `TasksPage`, and `ProfilePage`.
- `lib/notificationStyles.ts` — shared per-type icon/color map, previously duplicated between `NotificationBell` and `NotificationsPage`.
- `lib/formatRelativeTime.ts` *(from Phase 13, reused)*.

### Dashboard
- Removed the hardcoded mock `TASKS` array used to seed initial state — it caused a flash of fake tasks before the real list loaded. Upcoming Tasks now shows a proper skeleton while loading and a real empty state.
- Stat cards show "–" instead of a misleading "0" while still loading.

### Tasks (`/tasks`)
- Was a "Coming Soon" placeholder through Phase 13. Backend CRUD has been ready since the original build — this phase's explicit ask for search/filter/sort/validation isn't satisfiable on a placeholder, so it's now a real page: list, add (with validation), toggle complete, delete, search, status filter (all/pending/completed), sort (due date/title/newest), loading skeleton, empty states (no tasks vs. no matches).

### Notes (`/notes`)
- Added search (client-side filter over the already-fetched list, no new API calls), with a distinct "no matching notes" state vs. "no notes yet."
- Fixed the note-timestamp bug from the original audit that Phase 10–13 hadn't touched (`formatRelativeUpdated(null)` was hardcoded — every note said "Updated recently" regardless of actual date).

### Note Editor
- Swapped the local `Toast` for the shared one.
- "Retry" on a failed load now re-runs the fetch in place instead of `window.location.reload()` (full page flash).
- Added a live character count next to the content preview.

### AI Assistant (`/ai`)
- Was a static "Coming Soon" card. Now a real chat UI shell: message bubbles, typing indicator, auto-scroll, Enter-to-send, disabled send on empty input. Honestly labeled as a preview — there is still no AI backend, so replies are a clearly-worded placeholder rather than a faked "working" assistant. Built so a real `api.ai.chat(...)` call is a drop-in replacement for the simulated reply once a backend exists.

### Notifications
- Dropdown items now use the same per-type icon/color as the full page (previously just a plain unread dot) — more informative, and removes what would've been duplicated styling.
- Full page gained an All/Unread filter tab.

### Activity (`/activity`)
- Added a vertical timeline connector between entries and a defensive empty state. Timestamps are still the static mock strings from `data/activity.ts` (there's no real activity-log API — only Notifications has a live backend), so "better timestamps" wasn't fully achievable here without inventing data; flagged below.

### Profile
- **Edit Profile** now actually works: a validated modal (name required, branch/year optional) that calls the new `PATCH /api/auth/profile` and updates the page in place. Previously this was a "coming soon" toast with no backend behind it.
- "Notifications" settings row now navigates to the real Notifications page. "Privacy & Security" shows an honest "coming soon" toast (via the shared Toast) instead of doing nothing.

### Code quality
- `lib/api.ts`: `notifications.list()` changed from `(limit?: number)` to `(opts?: { limit?, type?, unreadOnly? })` — all three call sites (`NotificationBell`, `NotificationsPage`, `DashboardPage`) updated accordingly. Added `UserProfileDto` type and `auth.updateProfile()`.
- Removed the dead mock `TASKS` array from `DashboardPage`.
- Deduplicated: notification type styling (2 copies → 1), toast component (1 copy → 1 shared, used in 3 places instead of growing to 2 copies).

---

### Explicitly deferred / honest gaps
- **Real-time notifications are still polling** (30s), not push — unchanged from Phase 13; true real-time needs WebSockets/SSE, a bigger backend change intentionally out of scope here.
- **AI Assistant has no backend** — the new chat UI is a real, reusable shell, but responses are simulated and clearly labeled as such. No claim of working AI is made anywhere in the UI copy.
- **Activity Feed has no backend** — still `data/activity.ts` mock data; "better timestamps" there means visual polish only, not real relative-time computation (there's no real `createdAt` to compute from).
- **Avatar upload** was not built — no file storage exists in this project; the initials-avatar placeholder is unchanged.
- **`aiChats` stat** stays hardcoded at 0 everywhere — can't be populated honestly without an AI backend to count against.
- Standardizing API response envelopes (e.g. wrapping every response in `{ success, data }`) was **not** done — it would be a breaking change to every existing frontend call site built across Phases 10–13, which conflicts with "do not break existing features." Error shape (`{ error: string }`) and status codes were already consistent and are now enforced project-wide via `asyncHandler`.
