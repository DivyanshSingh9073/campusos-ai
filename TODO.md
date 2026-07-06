# CampusOS - TODO

## Phase 7 - Study Planner
- [x] Add study_planner table to Backend/src/db/schema.sql (subject, topic, study_date, completed, created_at, user_id FK)
- [x] Create Study Planner router: GET/POST/PUT/DELETE /api/study-planner
- [x] Add Study planner service helpers (optional) for listing/updating
- [x] Add TypeScript types for study planner
- [x] Wire router into Backend/src/index.ts

## Frontend - Study Planner
- [x] Add API client methods in Frontend/src/lib/api.ts for study planner CRUD
- [x] Create /study-planner page (StudyPlannerPage.tsx) with:
  - [ ] Today's sessions + upcoming
  - [ ] Add session modal (validate required fields)
  - [ ] Edit session modal
  - [ ] Delete confirmation
  - [ ] Empty/loading/error states
  - [ ] Simple monthly calendar highlighting study dates and today
  - [ ] Selecting a day filters sessions list
- [x] Add new route in Frontend/src/App.tsx for /study-planner
- [x] Integrate Dashboard integration:
  - [x] Fetch today + upcoming study sessions
  - [x] Show next study date
  - [x] Update DashboardPage.tsx UI cards/sections

## Validation / Error Handling
- [x] Ensure all backend endpoints validate required fields (subject, topic, studyDate)
- [x] Ensure each user only sees their own sessions
- [x] Return proper HTTP status codes (400/401/404/500 etc.)

## Build / Compile
- [x] TypeScript compile backend + frontend without errors
- [x] Run lint/build if available

## Registration / DB verification

### Step 1: Understand current backend
- [x] Inspect backend startup + routing
- [x] Inspect auth/register implementation

### Step 2: Verify DATABASE_URL + schema (no frontend edits)
- [ ] User runs `cd campusos-ai/Backend && npm run db:setup` using DATABASE_URL from `campusos-ai/Backend/.env`
- [ ] Paste full terminal output (success or error)

### Step 3: End-to-end registration test
- [ ] Start Backend + Frontend
- [ ] Create a new account
- [ ] Capture for POST `/api/auth/register`:
  - [ ] HTTP status code
  - [ ] Response body
  - [ ] Backend terminal output

### Backend Configuration
- [ ] Inspect backend configuration and DB connection code.
- [ ] Update `Backend/src/db/index.ts` to fail fast with a clear error if `DATABASE_URL` is missing.
- [ ] Build backend to confirm TypeScript compiles.
- [ ] Run backend (optional) to confirm startup behavior.