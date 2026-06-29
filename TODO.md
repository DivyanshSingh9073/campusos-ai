# TODO - Registration / DB verification

## Step 1: Understand current backend
- [x] Inspect backend startup + routing
- [x] Inspect auth/register implementation

## Step 2: Verify DATABASE_URL + schema (no frontend edits)
- [ ] User runs `cd campusos-ai/Backend && npm run db:setup` using DATABASE_URL from `campusos-ai/Backend/.env`
- [ ] Paste full terminal output (success or error)

## Step 3: End-to-end registration test
- [ ] Start Backend + Frontend
- [ ] Create a new account
- [ ] Capture for POST `/api/auth/register`:
  - [ ] HTTP status code
  - [ ] Response body
  - [ ] Backend terminal output

